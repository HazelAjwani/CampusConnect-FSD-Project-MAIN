from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['campusconnect']  # Database name
students_collection = db['students']
faculty_collection = db['faculty']
projects_collection = db['projects']

app = Flask(__name__)
CORS(app)

# testing route
@app.route('/')
def index():
    return 'its working'

@app.route('/all_areas')
def all_area_of_interests():
    # Aggregating distinct areas of interest from all collections
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
        if interest['_id']:  # Make sure the interest is not None
            all_interests.add(interest['_id'])
    for interest in faculty_interests:
        if interest['_id']:  # Make sure the interest is not None
            all_interests.add(interest['_id'])
    for interest in project_interests:
        if interest['_id']:  # Make sure the interest is not None
            all_interests.add(interest['_id'])
    
    # Sort and return the areas of interest, ensuring None values are removed
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

# creates student node
@app.route('/create_student', methods=['POST'])
def create_student():
    data = request.json
    student = {
        "student_name": data.get('student_name'),
        "prn": data.get('prn'),
        "email_id": data.get('email_id'),
        "department": data.get('department'),
        "area_of_interest": [data.get('area_of_int1'), data.get('area_of_int2')],
        "semester": data.get('sem'),
        "skills": data.get('skills')
    }
    result = students_collection.insert_one(student)
    return jsonify({"student_id": str(result.inserted_id)})

# creates faculty node
@app.route('/create_faculty', methods=['POST'])
def create_faculty():
    data = request.json
    faculty = {
        "name": data.get('name'),
        "email_id": data.get('email_id'),
        "department": data.get('department'),
        "area_of_interest": [data.get('area_of_int1'), data.get('area_of_int2')],
        "designation": data.get('designation')
    }
    result = faculty_collection.insert_one(faculty)
    return jsonify({"faculty_id": str(result.inserted_id)})

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

        # Validate that at least one of the fields is provided
        if not areaOfInterest and not skill:
            return jsonify({"error": "At least one search criterion (areaOfInterest or skill) is required"}), 400

        # Build the query filter
        query_filter = {}
        if areaOfInterest:
            query_filter["area_of_interest"] = areaOfInterest
        if skill:
            query_filter["skills"] = skill

        # Query MongoDB (use $and to ensure both conditions are met if provided)
        result = list(students_collection.find(query_filter))

        # If no results are found, return an empty list
        if not result:
            return jsonify([])  # Return an empty list instead of an error response

        # Format the results
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
        # Return an empty list instead of an error message
        return jsonify([]), 500  # Return empty list for error cases as well


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
            "Students": proj.get("students", []),
            "Faculties": proj.get("faculties", [])
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
    # Find all unique students that are part of any project
    engaged_students_cursor = projects_collection.aggregate([
        {"$unwind": "$students"},
        {"$group": {"_id": "$students"}}
    ])
    engaged_students = len(list(engaged_students_cursor))  # Count the unique students engaged in projects
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



if __name__ == '__main__':
    app.run(debug=True, port=8080)