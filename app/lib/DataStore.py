from tinydb import TinyDB, Query, where
from uuid import uuid4
import os
import pdb
import urllib.parse


class Filters(object):
    ID = 'id'
    STATUS = 'status'
    TAG = 'tag'
    TITLE = 'title'
    URL = 'url'
    TYPE = 'type'


class BaseType(object):
    def __init__(self, tbl, tblQuery):
        self.tbl = tbl
        self.tblQ = tblQuery

    def add(self, data):
        r = -1
        if isinstance(data, dict):
            row_id = self.tbl.insert(data)
            r = row_id
        return r

    def delete(self, eid):
        """
        Delete the Item given by ID
        """
        _id = self.remove_prefix(eid)
        self.tbl.remove(eids=[_id])
        return 0

    def update(self, data):
        """
        Update the data for the specified by the ID. 
        Replace all the data for the specific ID
        """
        # r = -1
        _id = self.remove_prefix(data.get('id'))
        r = self.tbl.update(data, eids=[_id])
        r = r[0]
        return r

    def get(self, filter, search, match_partial=False):
        w = ''
        data = {}

        # pdb.set_trace()
        if filter == Filters.ID:
            # pdb.set_trace()
            data = self.get_by_inbuilt_id(search)
        elif filter == Filters.STATUS:
            data = self.get_by_status(search, match_partial)
        elif filter == Filters.TYPE:
            data = self.get_by_type(search, match_partial)
        elif filter == Filters.TAG:
            data = self.get_by_tag(search, match_partial)
        elif filter == Filters.TITLE:
            data = self.get_by_title(search, match_partial)
        elif filter == Filters.URL:
            data = self.get_by_url(search, match_partial)
        else:
            data = {'error': 'Invalid Query Filter'}

        return data

    def get_by_inbuilt_id(self, search, **kwargs):
        _id = self.remove_prefix(search)
        return self.add_prefix(self.tbl.get(eid=_id), row_id=_id)

    def get_by_status(self, search, match_partial=False):
        w = where('status')
        return self.get_by_exact_match(w, search)

    def get_by_type(self, search, match_partial=False):
        w = where('type')
        return self.get_by_exact_match(w, search)

    def get_by_title(self, search, match_partial=False):
        q = self.tblQ.title.search(search)
        return self.get_by_partial_match(search=q)

    def get_by_tag(self, search, match_partial=False):
        w = where('tag')
        return self.get_by_exact_match(w, search)

    def get_by_url(self, search, match_partial=False):
        # pdb.set_trace()
        search = urllib.parse.unquote(search) 
        q = self.tblQ.url.matches(search)
        return self.get_by_partial_match(search=q)

    def get_by_exact_match(self, where_clause, search):
        return self.add_prefix(self.tbl.search(where_clause == search), None)
    
    def get_by_partial_match(self, search):
        try:
            return self.add_prefix(self.tbl.search(search), None)
        except Exception as e:
            # pdb.set_trace()
            if isinstance(e, TypeError):
                return {'error': True, 'message': e.msg}
            return {'error': True, 'input': e.pattern, 'message': e.msg, 'hint': 'don\'t search with * to match the prefix'}

    def add_prefix(self, data, row_id):
        if data:
            if isinstance(data, dict):
                data['id'] = '%s-%d' % (self.pfx, row_id)
            elif isinstance(data, list):
                # pdb.set_trace()
                for k in data:
                    k['id'] = '%s-%d' % (self.pfx, k.eid)
        return data

    def remove_prefix(self, eid):
        _id = eid.replace('%s-' % self.pfx, '')

        try:
            _id = int(_id)
        except ValueError:
            return eid
        else:
            return _id

    def get_all(self):
        return self.add_prefix(self.tbl.all(), row_id=None)

class Issue(BaseType):
    tbl, db, IssueTbl = None, None, None

    """
    Schema:
        {
            "desc": "******************",
            "status": OneOf('open', 'working', 'testing', 'completed', 'noissue'),
            "tag": null,
            "title": "hmm very big title with $@%^&",
            "type": OneOf('bug', 'task', 'feature'),
            "url": "/funny/bones"
        }    
    """

    @classmethod
    def get_connection(cls, db_dir='.'):
        if cls.db is None:
            cls.db = TinyDB(os.path.join(db_dir, 'issue.json'))
            cls.tbl = cls.db.table('issue')
            cls.IssueTbl = Query()
        return cls.tbl

    def __init__(self, db_dir='.', prefix='ISSUE'):
        self.tbl = self.get_connection(db_dir)
        self.tblQ = self.IssueTbl
        self.pfx = prefix
        super().__init__(self.tbl, self.tblQ)


class Story(BaseType):
    tbl, db, StoryTbl = None, None, None

    """
    Schema:
        {
            "desc": "******************",
            "status": OneOf('draft', 'in-review', 'working', 'implemented'),
            "tag": null,
            "title": "hmm very big title with $@%^&",
            "url": "/funny/bones"
            "issues": ['1', '2', '3']
        }    
    """

    @classmethod
    def get_connection(cls, db_dir='.'):
        if cls.db is None:
            cls.db = TinyDB(os.path.join(db_dir, 'story.json'))
            cls.tbl = cls.db.table('story')
            cls.StoryTbl = Query()
        return cls.tbl

    def __init__(self, db_dir='.', prefix='STORY'):        
        self.tbl = self.get_connection(db_dir)
        self.tblQ = self.StoryTbl
        self.pfx = prefix
        super().__init__(self.tbl, self.tblQ)

    def get_by_type(self, search, match_partial=False):
        """
        There should be no validation for "type", its not supposed to be present!
        """
        return False
