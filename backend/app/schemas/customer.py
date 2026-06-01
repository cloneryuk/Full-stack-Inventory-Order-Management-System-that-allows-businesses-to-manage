from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=20)


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
