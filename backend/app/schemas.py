from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student" # student, faculty, club_coordinator, admin

class UserCreate(UserBase):
    password: str
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    skills: Optional[str] = None # JSON string
    projects_info: Optional[str] = None # JSON string
    certifications: Optional[str] = None # JSON string
    social_links: Optional[str] = None # JSON string
    profile_photo_url: Optional[str] = None
    resume_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    skills: str
    projects_info: str
    certifications: str
    resume_url: Optional[str] = None
    profile_photo_url: Optional[str] = None
    social_links: str
    xp: int
    level: int
    
    class Config:
        from_attributes = True

# Academic Resource Schemas
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_type: str
    department: str
    year: int
    semester: int
    subject: str

class ResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    file_url: str
    file_type: str
    department: str
    year: int
    semester: int
    subject: str
    uploader_id: int
    likes_count: int
    bookmarks_count: int
    created_at: datetime
    uploader: UserResponse
    
    class Config:
        from_attributes = True

# Event Schemas
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    date: datetime
    location: str
    club_id: Optional[int] = None
    max_participants: Optional[int] = None
    feedback_form_url: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    type: str
    date: datetime
    location: str
    club_id: Optional[int] = None
    creator_id: int
    rsvp_count: int
    max_participants: Optional[int] = None
    qr_code: Optional[str] = None
    certificate_template: Optional[str] = None
    feedback_form_url: Optional[str] = None
    created_at: datetime
    creator: UserResponse

    class Config:
        from_attributes = True

class EventRegistrationResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    status: str
    registered_at: datetime
    event: EventResponse
    user: UserResponse

    class Config:
        from_attributes = True

# Club Schemas
class ClubCreate(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

class ClubResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    coordinator_id: Optional[int] = None
    members_count: int
    created_at: datetime
    coordinator: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ClubMemberResponse(BaseModel):
    id: int
    club_id: int
    user_id: int
    role: str
    joined_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

# Study Group Schemas
class StudyGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class StudyGroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    creator_id: int
    members_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Project Schemas
class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: str # JSON string list
    required_skills: str # JSON string list
    team_size: int
    vacancies: int

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    technologies: str
    required_skills: str
    team_size: int
    vacancies: int
    status: str
    creator_id: int
    created_at: datetime
    creator: UserResponse

    class Config:
        from_attributes = True

# Social Feed Schemas
class PostCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None # image, video, pdf, poll
    poll_options: Optional[str] = None # JSON string list

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    post_id: int
    content: str
    creator_id: int
    created_at: datetime
    creator: UserResponse

    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: int
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    poll_options: str
    poll_votes: str
    likes_count: int
    creator_id: int
    created_at: datetime
    creator: UserResponse
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True

# Messaging Schemas
class MessageCreate(BaseModel):
    content: str
    recipient_id: Optional[int] = None
    group_id: Optional[int] = None
    club_id: Optional[int] = None
    file_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    recipient_id: Optional[int] = None
    group_id: Optional[int] = None
    club_id: Optional[int] = None
    content: str
    file_url: Optional[str] = None
    created_at: datetime
    sender: UserResponse

    class Config:
        from_attributes = True

# Notice Schemas
class NoticeCreate(BaseModel):
    title: str
    content: str
    category: str # Academics, Examinations, Placements, Events, Scholarships, General

class NoticeResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    creator_id: int
    created_at: datetime
    creator: UserResponse

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationCreate(BaseModel):
    title: str
    content: str
    type: str = "general" # general, notice, placement, event
    target_role: str = "all" # all, student, faculty, etc.
    target_department: str = "all" # all, CSE, IT, etc.

class NotificationResponse(BaseModel):
    id: int
    title: str
    content: str
    type: str
    target_role: str
    target_department: str
    creator_id: int
    created_at: datetime
    creator: UserResponse

    class Config:
        from_attributes = True


# AI Interview Schemas
class InterviewStart(BaseModel):
    role_type: str # Frontend, Backend, HR, Aptitude

class InterviewUpdate(BaseModel):
    candidate_answer: str

class InterviewResponse(BaseModel):
    id: int
    role_type: str
    status: str
    history: str
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Placement Schemas
class PlacementCreate(BaseModel):
    company: str
    role: str
    type: str
    package: str
    min_cgpa: float
    max_backlogs: int
    eligible_branches: str
    deadline: str

class PlacementResponse(BaseModel):
    id: int
    company: str
    role: str
    type: str
    package: str
    min_cgpa: float
    max_backlogs: int
    eligible_branches: str
    deadline: str
    created_at: datetime

    class Config:
        from_attributes = True
