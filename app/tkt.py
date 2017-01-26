__author__ = 'ninad'

import pdb
import os
import datetime

from flask import Blueprint, render_template, current_app, Response, request, flash, redirect, url_for, jsonify
from flask import make_response
from lib.DataStore import Issue, Filters, Story
from lib.parser import IssueParser, StoryParser
from lib.utils import is_valid_query

api = Blueprint('api', __name__, url_prefix='/api')
issue_conn, story_conn = None, None

issue_parser = IssueParser()
story_parser = StoryParser()

# /api/v1/issue|story/add
# /api/v1/issue|story/update
# /api/v1/issue|story/delete
# /api/v1/issue|story/get

def get_table_handler(query):
    return issue_conn if query == 'issue' else story_conn

def failed_validation_message(err):
    return make_response(jsonify({'error': err}), 400) 

@api.record
def setup(setup_state):
    global issue_conn, story_conn

    app = setup_state.app
    folder_path = app.config['FOLDER_PATH']
    db_dir = os.path.join(folder_path['base'], 'db')

    issue_conn = Issue(db_dir, app.config.get('TICKET_ISSUE_PREFIX'))
    story_conn = Story(db_dir, app.config.get('TICKET_STORY_PREFIX'))

@api.route('/')
def index():
    return render_template('tkt.html')

@api.route('/v1/<string:query>/add', methods=['POST'])
# @login_required
def add_item(query):
    if is_valid_query(query):
        param = request.args or request.form
        data = {}
        
        if not param:
            return jsonify({'error': 'did not receive the data to be added'})

        # pdb.set_trace()
        parser = issue_parser if query == 'issue' else story_parser 
        
        data = parser.add_request(param)
        ok, err_msg = parser.validate(data)

        if ok:
            handler = get_table_handler(query) 
            new_id = handler.add(data)
            if new_id != -1:
                return jsonify({'id': new_id, 'ok': True})
            else:
                return jsonify({'id': -1, 'ok': False})
        return failed_validation_message(err_msg)
    
    return jsonify({'error': 'invalid query type'})

@api.route('/v1/<string:query>/get', methods=['GET'])
# @login_required
def get_item(query):
    param = request.args
    if is_valid_query(query):
        filter = param.get('filter', 'all').strip()
        search = param.get('search', '').strip()
        partial_match = param.get('partial', 0)

        partial_match = partial_match == '1'

        handler = get_table_handler(query)
        if filter == 'all':
            return jsonify(handler.get_all())
        else:
            # pdb.set_trace()
            return jsonify(handler.get(filter, search, partial_match))
    return jsonify({'error': 'invalid query type'})

@api.route('/v1/<string:query>/delete', methods=['GET'])
# @login_required
def remove_item(query):
    param = request.args

    if is_valid_query(query):
        if not param:
            return jsonify({'error': 'did not receive the data to be added'})

        parser = issue_parser if query == 'issue' else story_parser 
        
        data = parser.delete_request(param)
        ok, err_msg = parser.validate(data)

        handler = get_table_handler(query)

        if ok:
            return jsonify(handler.delete(eid=data['id']))
        else:
            return failed_validation_message(err_msg)

    return jsonify({'error': 'invalid query type'})

@api.route('/v1/<string:query>/update', methods=['POST'])
# @login_required
def update_item(query):
        param = request.args or request.form

        if not param:
            return jsonify({'error': 'did not receive data to be updated'})

        parser = issue_parser if query == 'issue' else story_parser 
        
        pdb.set_trace()
        data = parser.update_request(param)
        ok, err_msg = parser.validate(data)

        if ok:
            # pdb.set_trace()
            handler = get_table_handler(query) 
            _id = handler.update(data)
            if _id != -1:
                return jsonify({'id': _id, 'ok': True})
            else:
                return jsonify({'id': -1, 'ok': False})
        else:
            return failed_validation_message(err_msg)

        return jsonify({'error': 'failed validation [%s]' % error})
