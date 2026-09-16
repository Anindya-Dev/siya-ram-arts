import time
from typing import Any, Dict, List, Optional
import jwt
from jwt import PyJWKClient
from fastapi import Depends, Header, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.logging import logger

# JWKS cache for Clerk keys
_jwk_client: Optional[PyJWKClient] = None


def get_jwk_client() -> Optional[PyJWKClient]:
    global _jwk_client
    if _jwk_client is None and settings.CLERK_JWKS_URL:
        try:
            _jwk_client = PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True, max_cached_keys=16)
        except Exception as e:
            logger.warning(f"Could not initialize JWK client: {e}")
    return _jwk_client


def assert_production_security() -> None:
    """
    Hard safety check performed at app startup.
    If ENVIRONMENT is 'production', verifies that test-bypass mode is structurally unreachable.
    Raises RuntimeError if test-bypass flag is enabled or reachable in production environment.
    """
    is_prod = settings.ENVIRONMENT.lower() in ("production", "prod")
    if is_prod and getattr(settings, "ALLOW_TEST_AUTH_BYPASS", False):
        logger.critical("FATAL SECURITY MISCONFIGURATION: Test auth bypass enabled in production!")
        raise RuntimeError("FATAL SECURITY MISCONFIGURATION: Test auth bypass enabled in production!")
    if is_prod:
        logger.info("Security hardening verified: Production environment active, test auth bypass permanently disabled.")


async def verify_clerk_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Clerk-issued JWT token.
    Validates signature, expiration, and issuer.
    """
    is_prod = settings.ENVIRONMENT.lower() in ("production", "prod")

    # Hard safety guard: test token attempt in production fails immediately
    if token.startswith("test-token-"):
        if is_prod:
            logger.error("CRITICAL SECURITY WARNING: Attempted to use test token in production environment!")
            raise UnauthorizedError("Test authentication tokens are strictly prohibited in production environment.")
        elif settings.ENVIRONMENT.lower() in ("test", "testing", "development", "dev") or getattr(settings, "ALLOW_TEST_AUTH_BYPASS", False):
            parts = token.split("-")
            user_id = parts[2] if len(parts) > 2 else "user_test_default"
            role = parts[3] if len(parts) > 3 else "customer"
            return {"sub": user_id, "email": f"{user_id}@example.com", "role": role}

    try:
        jwk_client = get_jwk_client()
        if jwk_client:
            signing_key = jwk_client.get_signing_key_from_jwt(token)
            decode_options = {
                "verify_exp": True,
                "verify_aud": bool(settings.CLERK_AUDIENCE),
                "verify_iss": bool(settings.CLERK_ISSUER),
            }
            decode_kwargs = {
                "algorithms": ["RS256"],
                "options": decode_options,
            }
            if settings.CLERK_ISSUER:
                decode_kwargs["issuer"] = settings.CLERK_ISSUER
            if settings.CLERK_AUDIENCE:
                decode_kwargs["audience"] = settings.CLERK_AUDIENCE
            payload = jwt.decode(token, signing_key.key, **decode_kwargs)
            return payload
        else:
            # No JWKS client available. Fail closed in production; only allow the
            # local secret fallback for development/testing.
            if is_prod:
                logger.critical("CLERK_JWKS_URL is unavailable; refusing to verify JWTs in production.")
                raise UnauthorizedError("Authentication provider is misconfigured.")
            secret = settings.CLERK_SECRET_KEY or "dev_fallback_secret"
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_exp": True, "verify_aud": False},
            )
            return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired.")
    except jwt.PyJWTError as e:
        logger.warning(f"JWT verification failure: {e}")
        raise UnauthorizedError(f"Invalid authentication token: {str(e)}")


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Dependency that verifies Clerk JWT and retrieves/syncs the local User record.
    """
    from app.models.user import User, UserRole

    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or malformed Authorization header.")

    token = authorization.split(" ", 1)[1].strip()
    payload = await verify_clerk_token(token)
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise UnauthorizedError("Token does not contain a valid subject claim.")

    # Find user in local database
    stmt = select(User).where(User.clerk_user_id == clerk_user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Sync Clerk user to local database on first sign-in
        email = payload.get("email") or payload.get("primary_email_address") or f"{clerk_user_id}@devotee.siyaramarts.com"
        first_name = payload.get("first_name") or ""
        last_name = payload.get("last_name") or ""
        
        # Extract role properly from Clerk's publicMetadata (with fallback for testing tokens)
        role_claim = payload.get("publicMetadata", {}).get("role") or payload.get("role", "customer")
        role_claim = str(role_claim).lower()
        
        assigned_role = UserRole.ADMIN if role_claim == "admin" else (UserRole.STAFF if role_claim == "staff" else UserRole.CUSTOMER)

        user = User(
            clerk_user_id=clerk_user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=assigned_role,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        logger.info(f"Synchronized new Clerk user to local DB: {clerk_user_id} ({email}) as {assigned_role.value}")

    return user


async def get_optional_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[Any]:
    """
    Optional authentication dependency. Returns User if valid token provided, else None.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(request=request, authorization=authorization, db=db)
    except Exception:
        return None


def require_role(allowed_roles: List[str]):
    """
    Factory for RBAC route guards.
    """
    async def role_checker(current_user: Any = Depends(get_current_user)) -> Any:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role not in allowed_roles:
            logger.warning(
                f"Forbidden access: User {current_user.id} ({user_role}) attempted to access resource requiring {allowed_roles}"
            )
            raise ForbiddenError(f"Access forbidden: requires one of {allowed_roles} roles.")
        return current_user

    return role_checker


# Commonly used role guards
require_admin = require_role(["admin"])
require_staff_or_admin = require_role(["staff", "admin"])
require_customer_or_above = require_role(["customer", "staff", "admin"])