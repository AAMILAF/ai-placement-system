from fastapi import Depends, HTTPException
from security.auth import get_current_user

def require_role(role: str):
    def checker(user=Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="Access denied")
        return user
    return checker
