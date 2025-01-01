from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import re
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

client = MongoClient('mongodb://localhost:27017/')
db = client['campusconnect']  # Database name
students_collection = db['students']
faculty_collection = db['faculty']
projects_collection = db['projects']
join_requests_collection = db['join_requests']

app = Flask(__name__)
CORS(app)

otp_storage = {}

# testing 
@app.route('/')
def index():
    return 'its working'

# all areas of interest
@app.route('/all_areas')
def all_area_of_interests():
    student_interests = students_collection.aggregate([
        { "$unwind": "$area_of_interest" },
        { "$group": { "_id": "$area_of_interest" }}
    ])
    faculty_interests = faculty_collection.aggregate([
        { "$unwind": "$area_of_interest" },
        { "$group": { "_id": "$area_of_interest" }}
    ])
    project_interests = projects_collection.aggregate([
        { "$unwind": "$area_of_interest" },
        { "$group": { "_id": "$area_of_interest" }}
    ])

    all_interests = set()
    for interest in student_interests:
        if interest['_id']:  
            all_interests.add(interest['_id'])
    for interest in faculty_interests:
        if interest['_id']: 
            all_interests.add(interest['_id'])
    for interest in project_interests:
        if interest['_id']: 
            all_interests.add(interest['_id'])
    
    return jsonify(sorted([interest for interest in all_interests if interest is not None]))


# lists all skills
@app.route('/all_skills')
def all_skills():
    skills = students_collection.aggregate([
        { "$unwind": "$skills" },
        { "$group": { "_id": "$skills" }}
    ])
    skill_list = [skill['_id'] for skill in skills]
    return jsonify(sorted(skill_list))



# Email validation 
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email)

# Student Signup
@app.route('/create_student', methods=['POST'])
def create_student():
    data = request.json
    print(f"Received Data: {data}")

    if not is_valid_email(data.get('email_id')):
        return jsonify({"message": "Please enter a valid email address"}), 400

    # Check if the student already exists based on PRN or email
    existing_student = students_collection.find_one({
        "$or": [
            {"prn": data.get('prn')},
            {"email_id": data.get('email_id')}
        ]
    })
    
    print(f"Existing Student Check Result: {existing_student}")

    if existing_student:
        if existing_student.get('prn') == data.get('prn'):
            return jsonify({"message": "PRN already exists"}), 400
        elif existing_student.get('email_id') == data.get('email_id'):
            return jsonify({"message": "Email already exists"}), 400

    area_of_interest = [data.get('area_of_int1'), data.get('area_of_int2')]

    # student object
    student = {
        "student_name": data.get('student_name'),
        "prn": data.get('prn'),
        "email_id": data.get('email_id'),
        "department": data.get('department'),
        "area_of_interest": area_of_interest, 
        "semester": data.get('sem'),
        "skills": data.get('skills')
    }

    result = students_collection.insert_one(student)

    return jsonify({"message": "Sign up successful"}), 201


@app.route('/create_faculty', methods=['POST'])
def create_faculty():
    data = request.json
    print(f"Received Data: {data}")  

    required_fields = ['name', 'email_id', 'department', 'designation', 'area_of_interest']
    
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"message": "All fields are required"}), 400

    if not is_valid_email(data.get('email_id')):
        return jsonify({"message": "Please enter a valid email address"}), 400

    try:
        existing_student = students_collection.find_one({"email_id": data.get('email_id')})
        existing_faculty = faculty_collection.find_one({"email_id": data.get('email_id')})

        print("Existing student:", existing_student)
        print("Existing faculty:", existing_faculty)

        if existing_student or existing_faculty:
            return jsonify({"message": "Email already exists in student or faculty records"}), 400
    except Exception as e:
        print(f"Error checking for existing email: {e}")
        return jsonify({"message": "An error occurred while checking email existence"}), 500

    faculty = {
        "name": data.get('name'),
        "email_id": data.get('email_id'),
        "department": data.get('department'),
        "area_of_interest": data.get('area_of_interest'),  
        "designation": data.get('designation')
    }

    try:
        result = faculty_collection.insert_one(faculty)
        print(f"Faculty inserted with ID: {result.inserted_id}")
    except Exception as e:
        print(f"Error inserting faculty data: {e}")
        return jsonify({"message": "An error occurred while signing up"}), 500

    return jsonify({"message": "Faculty sign up successful", "faculty_id": str(result.inserted_id)}), 201



# find people with similar interest
@app.route('/find_people', methods=['POST'])
def find_people():
    data = request.json
    people = data.get('people')
    area = data.get('area')
    query = {"area_of_interest": area}
    
    if people == 'ALL':
        result = list(students_collection.find(query)) + list(faculty_collection.find(query))
    elif people == 'FACULTY':
        result = list(faculty_collection.find(query))
    else:
        result = list(students_collection.find(query))
    
    nodes = [{"name": person.get("name") if "name" in person else person.get("student_name"),
              "department": person.get("department"),
              "designation": person.get("designation") if "designation" in person else "",
              "prn": person.get("prn", ""),
              "email_id": person.get("email_id")} for person in result]
    
    if not nodes:
        nodes.append({'None': 'None'})
    return jsonify(nodes)


# find projects according to area of interest
@app.route('/find_projects', methods=['POST'])
def find_projects():
    data = request.json
    status = data.get('status')
    area = data.get('area')
    
    if status == 'All':
        result = list(projects_collection.find({"area_of_interest": area}))
    else:
        result = list(projects_collection.find({"area_of_interest": area, "status": status}))

    projects = [{"title": proj["title"], "area_of_interest": proj["area_of_interest"], 
                 "description": proj["description"], "status": proj["status"]} for proj in result]
    return jsonify(projects)


# find students according to the skill
from bson.json_util import dumps
import logging

@app.route('/find_students', methods=['POST'])
def find_students():
    try:
        data = request.json
        areaOfInterest = data.get('areaOfInterest')
        skill = data.get('skill')

        # provide atleast one field
        if not areaOfInterest and not skill:
            return jsonify({"error": "At least one search criterion (areaOfInterest or skill) is required"}), 400

        query_filter = {}
        if areaOfInterest:
            query_filter["area_of_interest"] = areaOfInterest
        if skill:
            query_filter["skills"] = skill

        result = list(students_collection.find(query_filter))

        # If no results are found, return an empty list
        if not result:
            return jsonify([])  

        students = [{
            "student_name": student["student_name"],
            "department": student["department"],
            "area_of_interest": student["area_of_interest"],
            "skills": student["skills"],
            "email_id": student["email_id"]
        } for student in result]

        return jsonify(students)

    except Exception as e:
        logging.error(f"Error in find_students: {str(e)}")
        return jsonify([]), 500  


# list the entire team
@app.route('/know-team', methods=['POST'])
def get_projects():
    data = request.json
    status = data.get('status')
    
    query = {"status": status} if status != 'All' else {}
    
    result = list(projects_collection.find(query))
    projects = []
    
    for proj in result:
        project = {
            "ProjectTitle": proj["title"],
            "ProjectDescription": proj["description"],
            "ProjectStatus": proj["status"],
            "Students": proj.get("students", [])
        }
        projects.append(project)
    
    return jsonify(projects)


## statistics
# Total number of people (students and faculty)
@app.route('/stat_count_total_ppl')
def stat_count_student_faculty():
    total_students = students_collection.count_documents({})
    total_faculty = faculty_collection.count_documents({})
    return jsonify({
        "total_students": total_students,
        "total_faculty": total_faculty
    })

# People engaged in projects (students)
@app.route('/stat_count_engaged_ppl')
def stat_count_engaged_ppl():
    engaged_students_cursor = projects_collection.aggregate([
        {"$unwind": "$students"},
        {"$group": {"_id": "$students"}}
    ])
    engaged_students = len(list(engaged_students_cursor))  
    return jsonify({"students_engaged": engaged_students})

# Project statistics (ongoing, planned, completed)
@app.route('/stat_count_projects')
def stat_count_projects():
    ongoing_projects = projects_collection.count_documents({"status": "Ongoing"})
    planned_projects = projects_collection.count_documents({"status": "Planned"})
    completed_projects = projects_collection.count_documents({"status": "Completed"})
    
    return jsonify({
        "ongoing_projects": ongoing_projects,
        "planned_projects": planned_projects,
        "completed_projects": completed_projects
    })



import os 
@app.route('/validate_student', methods=['POST'])
def validate_student():
    data = request.json
    student_name = data.get('student_name')
    print("Received student_name:", student_name)
    student = students_collection.find_one({"student_name": student_name})

    if student:
        return jsonify({"isValid": True}), 200
    else:
        return jsonify({"isValid": False, "message": "Please sign up first."}), 400



from werkzeug.utils import secure_filename
from bson import ObjectId
from flask import jsonify, request
import datetime


@app.route('/join_team_request', methods=['POST'])
def join_team_request():
    try:
        data = request.form
        student_name = data.get('student_name')
        prn = data.get('prn')
        email_id = data.get('email_id')
        department = data.get('department')
        contribution = data.get('contribution')
        resume = request.files.get('resume')
        project_id = data.get('project_id')  

        print(f"Received request: {data}")
        print(f"Resume: {resume}")
        print(f"Project ID: {project_id}")

        # Validate student exists in the database
        student = students_collection.find_one({"prn": prn, "email_id": email_id, "student_name": student_name})

        if not student:
            return jsonify({"success": False, "message": "Please sign up first."}), 400

        # Validate that the project exists
        project = projects_collection.find_one({"_id": ObjectId(project_id)})

        if not project:
            return jsonify({"success": False, "message": "Invalid project ID."}), 400

        # Extract the list of students already working on the project
        students_in_project = project.get('students', [])

        if prn in students_in_project:
            return jsonify({"success": False, "message": "You are already part of this project."}), 400

        # Prepare the join request data
        join_request = {
            "student_name": student_name,
            "prn": prn,
            "email_id": email_id,
            "department": department,
            "contribution": contribution,
            "project_id": ObjectId(project_id),  # Store the projectId in the join request
            "status": "Pending",  # Assuming "Pending" status for the request
            "notification_message": f"{student_name} has requested to join your project: {project['title']}.",  # Notification message
            "students_in_project": students_in_project  # Add the PRNs of students already in the project
        }

        # resume file handling
        if resume:
            resume_filename = f"{prn}_resume.pdf"
            resume_path = os.path.join('uploads', resume_filename)
            try:
                resume.save(resume_path)
                join_request["resume_path"] = resume_path
            except Exception as e:
                print(f"Error saving resume: {e}")
                return jsonify({"success": False, "message": "Error saving resume."}), 500

        result = join_requests_collection.insert_one(join_request)

        print(f"Join request submitted successfully with ID: {result.inserted_id}")

        # updating the project document to add the student's PRN to the students array
        # Using $push to ensure the student's PRN is added to the project
        projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$push": {"students": prn}}  
        )

        return jsonify({"success": True, "message": "Join request submitted successfully."}), 200

    except Exception as e:
        print(f"Error in join_team_request: {str(e)}")
        return jsonify({"success": False, "message": "Something went wrong."}), 500




@app.route('/find_project_id', methods=['POST'])
def find_project_id():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')

    project = projects_collection.find_one({
        "title": title,
        "description": description,
        "status": status
    })

    if project:
        return jsonify({"success": True, "projectId": str(project['_id'])}), 200
    else:
        return jsonify({"success": False, "message": "Project not found"}), 400
    

def generate_otp(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# OTP email using MIME
def send_otp_email(email, otp):
    sender_email = "exampleprojectcs@gmail.com"  
    sender_password = "tfbw vuew hgpg kyed" 
    receiver_email = email
    subject = "Your OTP Code"
    body = f"Your OTP code is: {otp}"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))  

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Start TLS encryption
            server.login(sender_email, sender_password)  # login with Gmail App Password
            text = msg.as_string()
            server.sendmail(sender_email, receiver_email, text)  # Send email
            print(f"OTP sent to {email}")
    except Exception as e:
        print(f"Error sending OTP: {e}")
        return jsonify({"message": "Failed to send OTP", "success": False}), 500

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')
    full_name = data.get('fullName')
    print("Received data:", data)

    if '@' not in email:
        return jsonify({"message": "Invalid email format", "success": False}), 400

    # Check if email exists in 'students' or 'faculty' collection
    student = db.students.find_one({"email_id": email})
    faculty = db.faculty.find_one({"email_id": email})

    if not student and not faculty:
        return jsonify({
            "message": "Please sign up first.",
            "success": False
        }), 400

    otp = generate_otp()

    # Store OTP temporarily in the dictionary 
    otp_storage[email] = otp

    send_otp_email(email, otp)

    return jsonify({
        "message": "OTP sent to your email",
        "success": True
    }), 200


@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    entered_otp = data.get('otp')
    
    # Check if OTP exists for the email
    if email in otp_storage:
        if otp_storage[email] == entered_otp:
            del otp_storage[email]  # Clear OTP once verified
            logged_in_users[email] = {
                "email": email  # Only store the email here
            }
            return jsonify({
                "message": "OTP verified successfully!",
                "success": True
            }), 200
        else:
            return jsonify({
                "message": "Invalid OTP. Please try again.",
                "success": False
            }), 400
    else:
        return jsonify({
            "message": "OTP expired or not requested. Please request a new OTP.",
            "success": False
        }), 400
    
logged_in_users = {}

@app.route('/add_project', methods=['POST'])
def add_project():
    try:
        # Get the logged-in user's email from the request
        email = request.json.get('email')
        print(f"Email: {email}")

        if not email or email not in logged_in_users:
            return jsonify({"error": "User not logged in or missing email"}), 401

        # Retrieve the PRN of the logged-in user
        logged_in_prn = logged_in_users[email]
        print(f"Logged-in PRN: {logged_in_prn}")

        entered_prn = request.json.get('prn')
        print(f"Entered PRN: {entered_prn}")

        if not entered_prn:
            return jsonify({"error": "PRN is required"}), 400

        # Check if the entered PRN exists in the database
        student = db.students.find_one({"prn": entered_prn})
        
        if not student:
            return jsonify({"error": "Entered PRN does not exist in the database"}), 404

        # Validate that the entered PRN matches the logged-in user's PRN
        if entered_prn != logged_in_prn:
            return jsonify({"error": "Entered PRN does not match the logged-in user's PRN"}), 403

        # Proceed to get project details from the form
        title = request.json.get('title')
        description = request.json.get('description')
        area_of_interest = request.json.get('area_of_interest')
        status = request.json.get('status')

        print(f"Title: {title}, Description: {description}, Area of Interest: {area_of_interest}, Status: {status}")

        if not title or not description or not area_of_interest or not status:
            return jsonify({"error": "Missing required fields"}), 400

        # Proceed to add the project to the database
        project_data = {
            "title": title,
            "description": description,
            "area_of_interest": area_of_interest,
            "status": status,
            "students": [logged_in_prn],  
        }

        print(f"Project Data: {project_data}")

        db.projects.insert_one(project_data)

        return jsonify({"message": "Project added successfully"}), 201

    except Exception as e:
        print(f"Error adding project: {str(e)}")
        return jsonify({"error": f"Error adding project: {str(e)}"}), 500




@app.route('/get-prn', methods=['GET'])
def get_prn():
    try:
        email = request.args.get('email')
        student = db.students.find_one({"email_id": email})
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        prn = student.get('prn')
        logged_in_users[email] = prn
        return jsonify({"prn": prn}), 200

    except Exception as e:
        print(f"Error fetching PRN: {str(e)}")
        return jsonify({"error": "Error fetching PRN"}), 500


@app.route('/get_notifications', methods=['GET'])
def get_notifications():
    try:
        email = request.args.get('email')  # Get student email from request
        if email not in logged_in_users:
            return jsonify({"error": "User not logged in"}), 401
        
        student_prn = logged_in_users[email]  
        
        # Find all join requests where this student's PRN is in the 'students_in_project'
        notifications = list(join_requests_collection.find({
            "students_in_project": student_prn
        }, {
            "notification_message": 1,  # Only fetch the notification message
            "_id": 0  
        }))
        
        print(f"Fetched notifications: {notifications}") 

        # Extract notification messages 
        notification_messages = [n["notification_message"] for n in notifications]

        return jsonify(notification_messages), 200  

    except Exception as e:
        print(f"Error in get_notifications: {str(e)}")
        return jsonify({"success": False, "message": "Something went wrong."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8080)