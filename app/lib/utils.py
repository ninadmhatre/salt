import datetime

PREFIX = {'issue': 'I', 'story': 'S'}

def is_valid_query(query):
    return query in ('issue', 'story')

def get_table_handler(query):
    return issue_conn if query == 'issue' else story_conn

def get_prefix(query):
    return PREFIX[query]

def get_unique_id(query):
    prefix = get_prefix(query)    
    return '%s%s' % (prefix, datetime.datetime.today().strftime('%y%m%d%H%M%S.%f')[:-3])
