from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Table
from sqlalchemy.orm import relationship
from app.db.session import Base

# Association table for followers/following
followers_association = Table(
    "followers",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("followed_id", Integer, ForeignKey("users.id", ondelete="CASCADE"))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="student") # student, faculty, club_coordinator, admin
    
    # Profile information
    roll_number = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True) # CSE, ECE, EEE, ME, CE, IT, AIDS, etc.
    year = Column(Integer, nullable=True) # 1, 2, 3, 4
    semester = Column(Integer, nullable=True) # 1, 2
    skills = Column(String, default="[]") # JSON string list
    projects_info = Column(String, default="[]") # JSON string list
    certifications = Column(String, default="[]") # JSON string list
    resume_url = Column(String, nullable=True)
    profile_photo_url = Column(String, nullable=True)
    social_links = Column(String, default="{}") # JSON string dict
    
    # Gamification
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    # Relationships
    following = relationship(
        "User",
        secondary=followers_association,
        primaryjoin=(id == followers_association.c.follower_id),
        secondaryjoin=(id == followers_association.c.followed_id),
        backref="followers"
    )
    
    resources = relationship("AcademicResource", back_populates="uploader")
    registrations = relationship("EventRegistration", back_populates="user")
    created_events = relationship("Event", back_populates="creator")
    clubs_coordinated = relationship("Club", back_populates="coordinator")
    club_memberships = relationship("ClubMember", back_populates="user")
    projects_created = relationship("Project", back_populates="creator")
    posts = relationship("Post", back_populates="creator")
    comments = relationship("Comment", back_populates="creator")
    interviews = relationship("InterviewSession", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")

class AcademicResource(Base):
    __tablename__ = "academic_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # pdf, docx, pptx, zip, etc.
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    subject = Column(String, nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    likes_count = Column(Integer, default=0)
    bookmarks_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    uploader = relationship("User", back_populates="resources")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False) # workshop, seminar, hackathon, cultural, sports
    date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rsvp_count = Column(Integer, default=0)
    max_participants = Column(Integer, nullable=True)
    qr_code = Column(String, nullable=True) # QR unique identifier string
    certificate_template = Column(String, nullable=True)
    feedback_form_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", back_populates="created_events")
    club = relationship("Club", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="registered") # registered, attended, feedback_submitted, certificate_generated
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")

class Club(Base):
    __tablename__ = "clubs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    coordinator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    members_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    coordinator = relationship("User", back_populates="clubs_coordinated")
    events = relationship("Event", back_populates="club")
    members = relationship("ClubMember", back_populates="club", cascade="all, delete-orphan")

class ClubMember(Base):
    __tablename__ = "club_members"
    
    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, default="member") # coordinator, core_team, member
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    club = relationship("Club", back_populates="members")
    user = relationship("User", back_populates="club_memberships")

class StudyGroup(Base):
    __tablename__ = "study_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    members_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    members = relationship("StudyGroupMember", back_populates="group", cascade="all, delete-orphan")

class StudyGroupMember(Base):
    __tablename__ = "study_group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("study_groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    group = relationship("StudyGroup", back_populates="members")
    user = relationship("User")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(String, default="[]") # JSON list
    required_skills = Column(String, default="[]") # JSON list
    team_size = Column(Integer, default=1)
    vacancies = Column(Integer, default=0)
    status = Column(String, default="recruiting") # recruiting, active, completed
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", back_populates="projects_created")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True) # image, video, pdf, poll
    poll_options = Column(String, default="[]") # JSON list
    poll_votes = Column(String, default="{}") # JSON dict {option: count}
    likes_count = Column(Integer, default=0)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", back_populates="comments")
    creator = relationship("User", back_populates="comments")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # for Direct Message
    group_id = Column(Integer, ForeignKey("study_groups.id", ondelete="CASCADE"), nullable=True) # for Study Group Chat
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=True) # for Club Chat
    content = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id])

class Notice(Base):
    __tablename__ = "notices"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False) # Academics, Examinations, Placements, Events, Scholarships, General
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String, default="general") # general, notice, placement, event
    target_role = Column(String, default="all") # all, student, faculty, club_coordinator
    target_department = Column(String, default="all") # all, CSE, IT, etc.
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User")


from sqlalchemy import Float

class Placement(Base):
    __tablename__ = "placements"
    
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    type = Column(String, default="Full Time")
    package = Column(String, nullable=False)
    min_cgpa = Column(Float, default=6.0)
    max_backlogs = Column(Integer, default=0)
    eligible_branches = Column(String, default="[]")
    deadline = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_type = Column(String, nullable=False) # Frontend, Backend, HR, Aptitude
    status = Column(String, default="active") # active, completed
    history = Column(Text, default="[]") # JSON list of messages: [{"role": "interviewer", "text": "..."}, {"role": "candidate", "text": "..."}]
    feedback = Column(Text, nullable=True) # JSON evaluation report
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="interviews")
