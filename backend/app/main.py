import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core import security
from app.db.session import engine, Base, get_db, SessionLocal
from app.models import (
    User, AcademicResource, Event, EventRegistration, Club, ClubMember, 
    StudyGroup, StudyGroupMember, Project, Post, Comment, Message, Notice, InterviewSession,
    Placement, Notification
)
from app.schemas import (
    UserCreate, UserUpdate, UserResponse, Token, ResourceCreate, ResourceResponse,
    EventCreate, EventResponse, EventRegistrationResponse, ClubCreate, ClubResponse,
    StudyGroupCreate, StudyGroupResponse, ProjectCreate, ProjectResponse,
    PostCreate, PostResponse, CommentCreate, CommentResponse, MessageCreate, MessageResponse,
    NoticeCreate, NoticeResponse, InterviewStart, InterviewResponse,
    PlacementCreate, PlacementResponse, NotificationCreate, NotificationResponse
)
from app.services.gemini import GeminiService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to front-end domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login-form")

# --- AUTHENTICATION DEPENDENCY ---
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Helper to reward XP
def reward_xp(user: User, amount: int, db: Session):
    user.xp += amount
    # Level formula: Level = 1 + (XP // 200)
    new_level = 1 + (user.xp // 200)
    level_up = new_level > user.level
    user.level = new_level
    db.commit()
    return level_up

# --- DATA SEEDING ---
def seed_database(db: Session):
    # Check if data is already seeded
    if db.query(User).filter(User.email == "admin@srgec.edu.in").first():
        return
        
    logger.info("Seeding initial campus data...")
    
    # 1. Create Users (Admin, HOD, Coordinators, Students)
    admin = User(
        email="admin@srgec.edu.in",
        full_name="SRGEC Administrator",
        hashed_password=security.get_password_hash("Admin@123"),
        role="admin",
        department="CSE",
        profile_photo_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        xp=1500,
        level=8
    )
    
    faculty1 = User(
        email="kiran@srgec.edu.in",
        full_name="Dr. Kiran Kumar",
        hashed_password=security.get_password_hash("Faculty@123"),
        role="faculty",
        department="CSE",
        profile_photo_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
        xp=1200,
        level=7
    )
    
    faculty2 = User(
        email="lakshmi@srgec.edu.in",
        full_name="Prof. Lakshmi Prasanna",
        hashed_password=security.get_password_hash("Faculty@123"),
        role="faculty",
        department="ECE",
        profile_photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        xp=800,
        level=5
    )
    
    coord = User(
        email="amit@srgec.edu.in",
        full_name="Amit Verma",
        hashed_password=security.get_password_hash("Coord@123"),
        role="club_coordinator",
        department="CSE",
        roll_number="22481A0501",
        year=3,
        semester=1,
        skills=json.dumps(["Python", "React", "Public Speaking", "Event Management"]),
        profile_photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        xp=600,
        level=4
    )
    
    student1 = User(
        email="pavan@srgec.edu.in",
        full_name="Pavan Kalyan",
        hashed_password=security.get_password_hash("Student@123"),
        role="student",
        department="CSE",
        roll_number="22481A0502",
        year=3,
        semester=1,
        skills=json.dumps(["FastAPI", "PostgreSQL", "React", "TypeScript", "Machine Learning"]),
        projects_info=json.dumps([{"title": "SRGEC Connect", "description": "AI-powered Digital Campus WebApp", "tech": "React, FastAPI, Gemini"}]),
        certifications=json.dumps(["Google Cloud Associate Cloud Engineer", "AWS Certified Solutions Architect"]),
        profile_photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        xp=450,
        level=3
    )

    student2 = User(
        email="divya@srgec.edu.in",
        full_name="Divya Sri",
        hashed_password=security.get_password_hash("Student@123"),
        role="student",
        department="IT",
        roll_number="22481A1201",
        year=3,
        semester=1,
        skills=json.dumps(["Java", "Spring Boot", "Data Structures", "Tailwind CSS"]),
        profile_photo_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        xp=350,
        level=2
    )
    
    db.add_all([admin, faculty1, faculty2, coord, student1, student2])
    db.commit()
    
    # 2. Create Clubs
    club_coding = Club(name="Coding Club", description="Empowering students to solve real-world problems using code. Regular hackathons and workshops.", logo_url="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=100", coordinator_id=coord.id, members_count=2)
    club_aiml = Club(name="AI & ML Club", description="Diving deep into Machine Learning algorithms, generative models, and computer vision projects.", logo_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100", coordinator_id=coord.id, members_count=1)
    club_robotics = Club(name="Robotics Club", description="Designing and programming intelligent autonomous machines. Embedded systems and IoT enthusiasts.", logo_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100", coordinator_id=admin.id, members_count=0)
    db.add_all([club_coding, club_aiml, club_robotics])
    db.commit()
    
    # Add members to Coding Club
    db.add_all([
        ClubMember(club_id=club_coding.id, user_id=coord.id, role="coordinator"),
        ClubMember(club_id=club_coding.id, user_id=student1.id, role="member"),
        ClubMember(club_id=club_aiml.id, user_id=student1.id, role="member"),
    ])
    db.commit()

    # 3. Create Resources
    resource1 = AcademicResource(
        title="Computer Networks Lecture Notes",
        description="Comprehensive hand-written notes covering OSI model, TCP/IP, and Routing protocols for CSE 3rd Year.",
        file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        file_type="pdf",
        department="CSE",
        year=3,
        semester=1,
        subject="Computer Networks",
        uploader_id=faculty1.id,
        likes_count=15
    )
    resource2 = AcademicResource(
        title="VLSI Design Lab Manual",
        description="Official laboratory guide containing schematic design and simulation experiments using Cadence tools.",
        file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        file_type="pdf",
        department="ECE",
        year=3,
        semester=1,
        subject="VLSI Design",
        uploader_id=faculty2.id,
        likes_count=8
    )
    db.add_all([resource1, resource2])
    db.commit()
    
    # 4. Create Events
    event1 = Event(
        title="CodeQuest 2026 Hackathon",
        description="A 24-hour development marathon organized by Coding Club to solve campus problems.",
        type="hackathon",
        date=datetime.now() + timedelta(days=5),
        location="CSE Seminar Hall",
        club_id=club_coding.id,
        creator_id=coord.id,
        rsvp_count=2,
        max_participants=100,
        qr_code="CODEQUEST_2026_TOKEN",
        feedback_form_url="https://forms.gle/mockfeedback"
    )
    event2 = Event(
        title="Generative AI & LLM Workshop",
        description="Hands-on session on prompting, Gemini API, and building RAG applications.",
        type="workshop",
        date=datetime.now() + timedelta(days=2),
        location="Mechanical Dept Seminar Hall",
        club_id=club_aiml.id,
        creator_id=faculty1.id,
        rsvp_count=1,
        max_participants=50,
        qr_code="GENAI_WORKSHOP_TOKEN"
    )
    db.add_all([event1, event2])
    db.commit()

    # RSVP Registrations
    db.add_all([
        EventRegistration(event_id=event1.id, user_id=student1.id, status="registered"),
        EventRegistration(event_id=event1.id, user_id=student2.id, status="registered"),
        EventRegistration(event_id=event2.id, user_id=student1.id, status="registered"),
    ])
    db.commit()
    
    # 5. Notices
    notice1 = Notice(
        title="Mid-I Examinations Timetable",
        content="B.Tech 3rd year Mid-I exam schedules are published. Exams start next Monday. Attendance is mandatory.",
        category="Examinations",
        creator_id=faculty1.id
    )
    notice2 = Notice(
        title="Cognizant Campus Recruitment Drive",
        content="Cognizant is hiring Software Engineers. Eligible Branches: CSE, IT, ECE. Min CGPA: 7.0. Register by Friday.",
        category="Placements",
        creator_id=admin.id
    )
    db.add_all([notice1, notice2])
    db.commit()
    
    # 6. Social Feed Posts
    post1 = Post(
        content="Super excited to announce the development of SRGEC Connect, our new unified campus platform! 🚀 Let us know what features you want to see most.",
        likes_count=10,
        creator_id=student1.id
    )
    post2 = Post(
        content="Which programming language do you prefer for competitive coding rounds?",
        media_type="poll",
        poll_options=json.dumps(["Python", "C++", "Java", "JavaScript"]),
        poll_votes=json.dumps({"Python": 5, "C++": 12, "Java": 3, "JavaScript": 1}),
        creator_id=coord.id
    )
    db.add_all([post1, post2])
    db.commit()
    
    db.add(Comment(post_id=post1.id, creator_id=student2.id, content="This looks amazing, Pavan! Can't wait to use the AI assistant features."))
    db.commit()

    # 7. Projects
    db.add(Project(
        title="IoT Smart Campus Irrigation",
        description="Automated garden irrigation using soil moisture sensors and NodeMCU connected to ESP Rainmaker.",
        technologies=json.dumps(["C++", "NodeMCU", "IoT Sensors", "ESP Rainmaker"]),
        required_skills=json.dumps(["Embedded C", "Circuit Design"]),
        team_size=3,
        vacancies=2,
        status="recruiting",
        creator_id=student1.id
    ))
    db.commit()

    # 8. Study Groups
    sg = StudyGroup(name="Machine Learning Study Circle", description="Weekly sessions discussing papers, Coursera ML exercises, and projects.", creator_id=student1.id, members_count=2)
    db.add(sg)
    db.commit()
    db.add_all([
        StudyGroupMember(group_id=sg.id, user_id=student1.id),
        StudyGroupMember(group_id=sg.id, user_id=student2.id)
    ])
    db.commit()
    
    # 9. Placements
    p1 = Placement(
        company="Cognizant",
        role="Programmer Analyst Trainee",
        type="Full Time",
        package="4.5 LPA",
        min_cgpa=6.5,
        max_backlogs=0,
        eligible_branches=json.dumps(["CSE", "IT", "ECE"]),
        deadline="2026-06-15"
    )
    p2 = Placement(
        company="TCS (Tata Consultancy Services)",
        role="Ninja & Digital Developer",
        type="Full Time",
        package="3.6 - 7.0 LPA",
        min_cgpa=6.0,
        max_backlogs=1,
        eligible_branches=json.dumps(["CSE", "IT", "ECE", "EEE", "ME", "CE"]),
        deadline="2026-06-20"
    )
    p3 = Placement(
        company="Amazon",
        role="Software Development Engineer Intern",
        type="Internship",
        package="80,000 / month",
        min_cgpa=8.0,
        max_backlogs=0,
        eligible_branches=json.dumps(["CSE", "IT"]),
        deadline="2026-06-10"
    )
    db.add_all([p1, p2, p3])
    db.commit()
    
    # Seed notifications
    n1 = Notification(
        title="Welcome to SRGEC Connect!",
        content="Welcome to the next-generation digital campus platform! Use the AI career coach, study resources, and social threads.",
        type="general",
        target_role="all",
        target_department="all",
        creator_id=admin.id
    )
    n2 = Notification(
        title="Official Placement Drive: Cognizant",
        content="Cognizant has announced a drive for Programmer Analyst Trainee. Package: 4.5 LPA. Deadline: June 15.",
        type="placement",
        target_role="student",
        target_department="all",
        creator_id=admin.id
    )
    n3 = Notification(
        title="Official Notice: Mid-I Examinations Schedule",
        content="B.Tech 3rd year Mid-I exam schedules are published. Check the notice board for details.",
        type="notice",
        target_role="student",
        target_department="CSE",
        creator_id=faculty1.id
    )
    db.add_all([n1, n2, n3])
    db.commit()
    
    logger.info("Initial seeding completed!")

# Seed on app startup
@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


# --- AUTH ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=security.get_password_hash(user_in.password),
        role=user_in.role,
        roll_number=user_in.roll_number,
        department=user_in.department,
        year=user_in.year,
        semester=user_in.semester,
        xp=100, # Base joining XP
        level=1
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post(f"{settings.API_V1_STR}/auth/login-form", response_model=Token)
def login_form(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # OAuth2 specifies username, we use it for email
    user = db.query(User).filter(User.email == username).first()
    if not user or not security.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Award daily/login XP
    reward_xp(user, 10, db)
    
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post(f"{settings.API_V1_STR}/auth/login", response_model=Token)
def login(payload: Dict[str, str], db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")
    user = db.query(User).filter(User.email == email).first()
    if not user or not security.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    reward_xp(user, 10, db)
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get(f"{settings.API_V1_STR}/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put(f"{settings.API_V1_STR}/auth/profile", response_model=UserResponse)
def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    # Reward XP for profile details completion
    reward_xp(current_user, 20, db)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get(f"{settings.API_V1_STR}/auth/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post(f"{settings.API_V1_STR}/auth/follow/{{user_id}}")
def follow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user in current_user.following:
        current_user.following.remove(target_user)
        message = f"Unfollowed {target_user.full_name}"
    else:
        current_user.following.append(target_user)
        message = f"Following {target_user.full_name}"
        reward_xp(current_user, 5, db)
        
    db.commit()
    return {"message": message}

@app.get(f"{settings.API_V1_STR}/auth/leaderboard", response_model=List[UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.xp.desc()).limit(10).all()


# --- ACADEMIC RESOURCES ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/resources/upload", response_model=ResourceResponse)
def upload_resource(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    department: str = Form(...),
    year: int = Form(...),
    semester: int = Form(...),
    subject: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save file locally
    file_extension = file.filename.split(".")[-1]
    filename = f"{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
        
    db_resource = AcademicResource(
        title=title,
        description=description,
        file_url=f"/api/v1/resources/download/{filename}",
        file_type=file_extension,
        department=department,
        year=year,
        semester=semester,
        subject=subject,
        uploader_id=current_user.id
    )
    db.add(db_resource)
    reward_xp(current_user, 50, db) # High XP for sharing resources!
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.get(f"{settings.API_V1_STR}/resources/list", response_model=List[ResourceResponse])
def list_resources(
    department: Optional[str] = None,
    year: Optional[int] = None,
    semester: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AcademicResource)
    if department:
        query = query.filter(AcademicResource.department == department)
    if year:
        query = query.filter(AcademicResource.year == year)
    if semester:
        query = query.filter(AcademicResource.semester == semester)
    if search:
        query = query.filter(
            AcademicResource.title.ilike(f"%{search}%") | 
            AcademicResource.subject.ilike(f"%{search}%") |
            AcademicResource.description.ilike(f"%{search}%")
        )
    return query.order_by(AcademicResource.created_at.desc()).all()

@app.get(f"{settings.API_V1_STR}/resources/download/{{filename}}")
def download_resource(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@app.post(f"{settings.API_V1_STR}/resources/{{resource_id}}/like")
def like_resource(resource_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = db.query(AcademicResource).filter(AcademicResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    res.likes_count += 1
    # Reward uploader
    uploader = db.query(User).filter(User.id == res.uploader_id).first()
    if uploader:
        reward_xp(uploader, 10, db)
    db.commit()
    return {"likes_count": res.likes_count}


# --- EVENTS ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/events/create", response_model=EventResponse)
def create_event(event_in: EventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["faculty", "club_coordinator", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized role to create events")
        
    qr_token = f"EVENT_{event_in.title.upper().replace(' ', '_')}_{datetime.now().timestamp()}"
    
    db_event = Event(
        title=event_in.title,
        description=event_in.description,
        type=event_in.type,
        date=event_in.date,
        location=event_in.location,
        club_id=event_in.club_id,
        creator_id=current_user.id,
        max_participants=event_in.max_participants,
        qr_code=qr_token,
        feedback_form_url=event_in.feedback_form_url,
        certificate_template="Standard SRGEC Event Participation Certificate"
    )
    db.add(db_event)
    reward_xp(current_user, 30, db)
    db.commit()
    db.refresh(db_event)
    
    # Auto-create notification for event
    try:
        event_notif = Notification(
            title=f"New Event: {db_event.title}",
            content=f"An event '{db_event.title}' ({db_event.type}) is scheduled at {db_event.location} on {db_event.date.strftime('%Y-%m-%d %H:%M')}.",
            type="event",
            target_role="all",
            target_department="all",
            creator_id=current_user.id
        )
        db.add(event_notif)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to auto-create notification for event: {e}")
        
    return db_event

@app.get(f"{settings.API_V1_STR}/events/list", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.date.asc()).all()

@app.post(f"{settings.API_V1_STR}/events/{{event_id}}/register", response_model=EventRegistrationResponse)
def register_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
        
    if event.max_participants and event.rsvp_count >= event.max_participants:
        raise HTTPException(status_code=400, detail="Event registration limit reached")
        
    registration = EventRegistration(event_id=event_id, user_id=current_user.id, status="registered")
    event.rsvp_count += 1
    db.add(registration)
    reward_xp(current_user, 15, db) # 15 XP for joining events
    db.commit()
    db.refresh(registration)
    return registration

@app.post(f"{settings.API_V1_STR}/events/{{event_id}}/attendance")
def scan_attendance(
    event_id: int, 
    payload: Dict[str, str], 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    qr_scanned = payload.get("qr_code")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.qr_code != qr_scanned:
        raise HTTPException(status_code=400, detail="Invalid QR Code for this event")
        
    reg = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="You are not registered for this event")
        
    if reg.status == "attended":
        return {"message": "Attendance already marked", "certificate_generated": True}
        
    reg.status = "attended"
    reward_xp(current_user, 40, db) # 40 XP for attending!
    db.commit()
    
    return {"message": "Attendance verified successfully! Certificate unlocked.", "certificate_generated": True}

@app.post(f"{settings.API_V1_STR}/events/{{event_id}}/feedback")
def submit_feedback(
    event_id: int,
    feedback: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reg = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    reg.status = "feedback_submitted"
    reward_xp(current_user, 10, db)
    db.commit()
    return {"message": "Feedback submitted, thank you!"}


# --- CLUBS ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/clubs/create", response_model=ClubResponse)
def create_club(club_in: ClubCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create clubs")
        
    db_club = Club(name=club_in.name, description=club_in.description, logo_url=club_in.logo_url)
    db.add(db_club)
    db.commit()
    db.refresh(db_club)
    return db_club

@app.get(f"{settings.API_V1_STR}/clubs/list", response_model=List[ClubResponse])
def list_clubs(db: Session = Depends(get_db)):
    return db.query(Club).all()

@app.post(f"{settings.API_V1_STR}/clubs/{{club_id}}/join")
def join_club(club_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    existing = db.query(ClubMember).filter(
        ClubMember.club_id == club_id,
        ClubMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this club")
        
    membership = ClubMember(club_id=club_id, user_id=current_user.id, role="member")
    club.members_count += 1
    db.add(membership)
    reward_xp(current_user, 25, db) # 25 XP for club integration
    db.commit()
    return {"message": f"Successfully joined {club.name}"}


# --- STUDY GROUPS ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/study-groups/create", response_model=StudyGroupResponse)
def create_study_group(sg_in: StudyGroupCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sg = StudyGroup(name=sg_in.name, description=sg_in.description, creator_id=current_user.id, members_count=1)
    db.add(sg)
    db.commit()
    db.refresh(sg)
    
    # Add creator as member
    member = StudyGroupMember(group_id=sg.id, user_id=current_user.id)
    db.add(member)
    reward_xp(current_user, 15, db)
    db.commit()
    return sg

@app.get(f"{settings.API_V1_STR}/study-groups/list", response_model=List[StudyGroupResponse])
def list_study_groups(db: Session = Depends(get_db)):
    return db.query(StudyGroup).all()

@app.post(f"{settings.API_V1_STR}/study-groups/{{group_id}}/join")
def join_study_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sg = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not sg:
        raise HTTPException(status_code=404, detail="Study group not found")
        
    existing = db.query(StudyGroupMember).filter(
        StudyGroupMember.group_id == group_id,
        StudyGroupMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this study group")
        
    member = StudyGroupMember(group_id=group_id, user_id=current_user.id)
    sg.members_count += 1
    db.add(member)
    reward_xp(current_user, 10, db)
    db.commit()
    return {"message": f"Successfully joined study group: {sg.name}"}


# --- SOCIAL FEED ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/social/post", response_model=PostResponse)
def create_post(post_in: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    votes_initial = {}
    options = []
    if post_in.poll_options:
        options = json.loads(post_in.poll_options)
        votes_initial = {option: 0 for option in options}
        
    db_post = Post(
        content=post_in.content,
        media_url=post_in.media_url,
        media_type=post_in.media_type,
        poll_options=json.dumps(options),
        poll_votes=json.dumps(votes_initial),
        creator_id=current_user.id
    )
    db.add(db_post)
    reward_xp(current_user, 20, db)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get(f"{settings.API_V1_STR}/social/feed", response_model=List[PostResponse])
def get_feed(db: Session = Depends(get_db)):
    return db.query(Post).order_by(Post.created_at.desc()).all()

@app.post(f"{settings.API_V1_STR}/social/post/{{post_id}}/like")
def like_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes_count += 1
    
    # Reward creator
    creator = db.query(User).filter(User.id == post.creator_id).first()
    if creator:
        reward_xp(creator, 5, db)
        
    db.commit()
    return {"likes_count": post.likes_count}

@app.post(f"{settings.API_V1_STR}/social/post/{{post_id}}/comment", response_model=CommentResponse)
def create_comment(post_id: int, comment_in: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    comment = Comment(post_id=post_id, creator_id=current_user.id, content=comment_in.content)
    db.add(comment)
    reward_xp(current_user, 5, db)
    db.commit()
    db.refresh(comment)
    return comment

@app.post(f"{settings.API_V1_STR}/social/post/{{post_id}}/vote")
def vote_poll(post_id: int, payload: Dict[str, str], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.media_type != "poll":
        raise HTTPException(status_code=400, detail="Invalid poll post")
        
    choice = payload.get("choice")
    votes = json.loads(post.poll_votes)
    if choice not in votes:
        raise HTTPException(status_code=400, detail="Invalid choice option")
        
    votes[choice] += 1
    post.poll_votes = json.dumps(votes)
    reward_xp(current_user, 5, db)
    db.commit()
    return {"poll_votes": votes}


# --- PROJECTS HUB ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/projects/create", response_model=ProjectResponse)
def create_project(proj_in: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proj = Project(
        title=proj_in.title,
        description=proj_in.description,
        technologies=proj_in.technologies,
        required_skills=proj_in.required_skills,
        team_size=proj_in.team_size,
        vacancies=proj_in.vacancies,
        creator_id=current_user.id
    )
    db.add(proj)
    reward_xp(current_user, 25, db)
    db.commit()
    db.refresh(proj)
    return proj

@app.get(f"{settings.API_V1_STR}/projects/list", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()


# --- PLACEMENT PORTAL ENDPOINTS ---

@app.get(f"{settings.API_V1_STR}/placements/jobs")
def list_placements(db: Session = Depends(get_db)):
    placements = db.query(Placement).order_by(Placement.created_at.desc()).all()
    res = []
    for p in placements:
        try:
            branches = json.loads(p.eligible_branches)
        except Exception:
            branches = []
        res.append({
            "id": p.id,
            "company": p.company,
            "role": p.role,
            "type": p.type,
            "package": p.package,
            "min_cgpa": p.min_cgpa,
            "max_backlogs": p.max_backlogs,
            "eligible_branches": branches,
            "deadline": p.deadline
        })
    return res

@app.post(f"{settings.API_V1_STR}/placements/create", response_model=PlacementResponse)
def create_placement(
    placement_in: PlacementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and admin can post placement details")
        
    placement = Placement(
        company=placement_in.company,
        role=placement_in.role,
        type=placement_in.type,
        package=placement_in.package,
        min_cgpa=placement_in.min_cgpa,
        max_backlogs=placement_in.max_backlogs,
        eligible_branches=placement_in.eligible_branches,
        deadline=placement_in.deadline
    )
    db.add(placement)
    reward_xp(current_user, 30, db)
    db.commit()
    db.refresh(placement)
    
    # Auto-create notification for placement
    try:
        placement_notif = Notification(
            title=f"New Recruitment Drive: {placement.company}",
            content=f"{placement.company} is hiring for the role of '{placement.role}' ({placement.type}). Package: {placement.package}. Apply by {placement.deadline}.",
            type="placement",
            target_role="student",
            target_department="all",
            creator_id=current_user.id
        )
        db.add(placement_notif)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to auto-create notification for placement: {e}")
        
    return placement

@app.post(f"{settings.API_V1_STR}/placements/eligibility")
def check_eligibility(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_id = payload.get("job_id")
    cgpa = float(payload.get("cgpa", 0.0))
    backlogs = int(payload.get("backlogs", 0))
    branch = payload.get("branch", "").upper()
    
    job = db.query(Placement).filter(Placement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job entry not found")
        
    try:
        branches = json.loads(job.eligible_branches)
    except Exception:
        branches = []
        
    reasons = []
    if cgpa < job.min_cgpa:
        reasons.append(f"CGPA ({cgpa}) is lower than requirement ({job.min_cgpa})")
    if backlogs > job.max_backlogs:
        reasons.append(f"Active backlogs ({backlogs}) exceed allowed count ({job.max_backlogs})")
    if branch not in branches:
        reasons.append(f"Branch '{branch}' is not in eligible lists: {branches}")
        
    is_eligible = len(reasons) == 0
    return {"eligible": is_eligible, "reasons": reasons}

@app.post(f"{settings.API_V1_STR}/placements/ats-check")
def ats_check(payload: Dict[str, str], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume_text = payload.get("resume_text", "")
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text must not be empty")
        
    analysis = GeminiService.analyze_resume(resume_text)
    reward_xp(current_user, 15, db)
    return analysis


# --- AI ASSISTANT ENDPOINT ---

@app.post(f"{settings.API_V1_STR}/ai/ask")
def ask_assistant(payload: Dict[str, str], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = payload.get("question", "")
    mode = payload.get("mode", "beginner") # beginner, exam, expert, teacher
    
    # Optional document context lookup (mocking search over resources)
    context = ""
    if "network" in question.lower() or "protocol" in question.lower():
        context = "A network protocol is an established set of rules that determine how data is transmitted between different devices in the same network."
    
    response = GeminiService.generate_academic_response(question, mode, context)
    reward_xp(current_user, 5, db) # 5 XP for learning!
    return {"answer": response}


# --- MOCK INTERVIEW ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/ai/interview/start", response_model=InterviewResponse)
def start_interview(payload: InterviewStart, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = payload.role_type
    
    # Initialize history
    first_question, _ = GeminiService._get_mock_interview_step(role, 0, "")
    history = [{"role": "interviewer", "text": first_question}]
    
    session = InterviewSession(
        user_id=current_user.id,
        role_type=role,
        status="active",
        history=json.dumps(history)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.post(f"{settings.API_V1_STR}/ai/interview/{{session_id}}/answer", response_model=InterviewResponse)
def submit_interview_answer(
    session_id: int,
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Interview already completed")
        
    candidate_answer = payload.get("answer", "")
    history = json.loads(session.history)
    
    # Add candidate answer to history
    history.append({"role": "candidate", "text": candidate_answer})
    
    # Generate next question or feedback
    next_step, is_completed = GeminiService.get_interview_response(session.role_type, history, candidate_answer)
    
    if is_completed:
        session.status = "completed"
        session.feedback = next_step  # Next step contains JSON feedback
        # Reward massive XP for completing a mock interview!
        reward_xp(current_user, 100, db)
    else:
        history.append({"role": "interviewer", "text": next_step})
        session.history = json.dumps(history)
        
    db.commit()
    db.refresh(session)
    return session


# --- NOTICES ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/notices/create", response_model=NoticeResponse)
def create_notice(notice_in: NoticeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and admin can post official notices")
        
    notice = Notice(
        title=notice_in.title,
        content=notice_in.content,
        category=notice_in.category,
        creator_id=current_user.id
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    
    # Auto-create notification for notice
    try:
        notice_notif = Notification(
            title=f"Official Notice: {notice.title}",
            content=notice.content,
            type="notice",
            target_role="student" if notice.category in ["Examinations", "Placements", "Academics"] else "all",
            target_department="all", # general alert
            creator_id=current_user.id
        )
        db.add(notice_notif)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to auto-create notification for notice: {e}")
        
    return notice

@app.get(f"{settings.API_V1_STR}/notices/list", response_model=List[NoticeResponse])
def list_notices(db: Session = Depends(get_db)):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()

# --- NOTIFICATIONS ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/notifications/create", response_model=NotificationResponse)
def create_notification(
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and admin can create custom notifications")
        
    notification = Notification(
        title=notification_in.title,
        content=notification_in.content,
        type=notification_in.type,
        target_role=notification_in.target_role,
        target_department=notification_in.target_department,
        creator_id=current_user.id
    )
    db.add(notification)
    reward_xp(current_user, 20, db) # 20 XP for broadcasting notifications
    db.commit()
    db.refresh(notification)
    return notification

@app.get(f"{settings.API_V1_STR}/notifications/list", response_model=List[NotificationResponse])
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    
    if current_user.role == "student":
        query = query.filter(
            (Notification.target_role.in_(["all", "student"])) &
            (Notification.target_department.in_(["all", current_user.department]))
        )
    else:
        query = query.filter(
            (Notification.target_role.in_(["all", current_user.role])) &
            (Notification.target_department.in_(["all", current_user.department]))
        )
        
    return query.order_by(Notification.created_at.desc()).all()


# --- REAL-TIME WEBSOCKET CHAT MANAGER ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {} # Map userId to active sockets
        
    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected via WebSocket")
        
    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket")
        
    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass
                    
    async def broadcast_to_group(self, message: dict, members_ids: List[int]):
        for user_id in members_ids:
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Message format: { "recipient_id": X, "group_id": Y, "content": "..." }
            recipient_id = message_data.get("recipient_id")
            group_id = message_data.get("group_id")
            content = message_data.get("content")
            
            db_msg = Message(
                sender_id=user_id,
                recipient_id=recipient_id,
                group_id=group_id,
                content=content
            )
            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)
            
            # Structure serialized message
            sender_user = db.query(User).filter(User.id == user_id).first()
            msg_payload = {
                "id": db_msg.id,
                "sender_id": user_id,
                "recipient_id": recipient_id,
                "group_id": group_id,
                "content": content,
                "created_at": db_msg.created_at.isoformat(),
                "sender": {
                    "id": sender_user.id,
                    "full_name": sender_user.full_name,
                    "role": sender_user.role,
                    "profile_photo_url": sender_user.profile_photo_url
                }
            }
            
            if recipient_id:
                # Direct Message
                await manager.send_personal_message(msg_payload, recipient_id)
                # Echo to sender (if they have other open tabs)
                await manager.send_personal_message(msg_payload, user_id)
            elif group_id:
                # Study Group Message
                members = db.query(StudyGroupMember).filter(StudyGroupMember.group_id == group_id).all()
                member_ids = [m.user_id for m in members]
                await manager.broadcast_to_group(msg_payload, member_ids)
                
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id, websocket)
