import re
import sys
from lib.utils import get_unique_id
import pdb
import datetime
from markdown import markdown


class StoryParser(object):
    def __init__(self):
        print('Initializing StoryParser')
        self.name = 'story'
        self.validator = Validator()
        self.set_rules()

    def set_rules(self):
        self.rules = {
            'status': (self.validator.rule_InList, {'values': ['draft', 'inreview', 'working', 'implemented']}),
            'type': (self.validator.rule_ForceFail, {}),
            'tag': (self.validator.rule_NoSpace, {'skip_null_check': True}),
            # 'id': (self.validator.rule_TextMatch, {'startswith': 'S'}),
            'issues': (self.validator.rule_TypeCheck, {'types': (list,)})
        }

    def validate(self, data, skip=None):
        skip = skip if skip else []

        for k, v in data.items():
            if k in skip:
                continue
            rule, kwargs = self.rules.get(k, (self.validator.rule_NotNull, {}))
            result = rule(v, **kwargs)

            if not result:            
                return False, "%s key falied validation" % k

        return True, None

    def add_request(self, param):
        data = {}

        # data['id'] = get_unique_id(self.name)
        data['title'] = param.get('title')
        data['desc'] = markdown(param.get('desc'))
        data['url'] = param.get('url')
        data['status'] = param.get('status')
        data['tag'] = param.get('tag')
        data['issues'] = param.get('issues').split(',')
        data['ctime'] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        data['utime'] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

        return data

    def update_request(self, param):
        data = {}
        
        data['id'] = param.get('id')
        data['title'] = param.get('title')
        data['desc'] = markdown(param.get('desc'))
        data['url'] = param.get('url')
        data['status'] = param.get('status')
        data['tag'] = param.get('tag')
        data['issues'] = param.get('issues').split(',')
        data['utime'] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

        return data

    def delete_request(self, param):
        return {'id': param.get('id')}

    def get_request(self, filter, search):
        pass

class IssueParser(object):
    def __init__(self):
        print('Initializing IssueParser')
        self.name = 'issue'
        self.validator = Validator()
        self.set_rules()

    def set_rules(self):
        self.rules = {
            'status': (self.validator.rule_InList, {'values': ['open', 'working', 'testing', 'completed', 'noissue']}),
            'type': (self.validator.rule_InList, {'values': ['bug', 'task', 'feature']}),
            'tag': (self.validator.rule_NoSpace, {'skip_null_check': True})
        }

    def validate(self, data, skip=None):
        skip = skip if skip else []

        # pdb.set_trace()
        for k, v in data.items():
            if k in skip:
                continue
            rule, kwargs = self.rules.get(k, (self.validator.rule_NotNull, {}))
            result = rule(v, **kwargs)

            if not result:            
                return False, "%s key falied validation" % k

        return True, None

    def add_request(self, param):
        data = {}

        # data['id'] = get_unique_id(self.name)
        data['title'] = param.get('title')
        data['desc'] = markdown(param.get('desc'))
        data['url'] = param.get('url')
        data['type'] = param.get('type')
        data['status'] = param.get('status')
        data['tag'] = param.get('tag')
        data['ctime'] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        data['utime'] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

        return data

    def update_request(self, param):
        data = {}

        data['id'] = param.get('id')
        data['title'] = param.get('title')
        data['desc'] = markdown(param.get('desc'))
        data['url'] = param.get('url')
        data['type'] = param.get('type')
        data['status'] = param.get('status')
        data['tag'] = param.get('tag')
        data['utime'] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

        return data

    def delete_request(self, param):
        return {'id': param.get('id')}

    def get_request(self, filter, search):
        pass


class Validator(object):
    """
    define validation rules, and if rule returns True its valid otherwise not!

    every rule should start with "rule_" keyword and all rules must return bool value and optional
    error message
    """

    def __init__(self):
        self.rules = {}
        self.val_InList = []

    def setup(**kwargs):
        for k, v in kwargs.items():
            if k == 'val_InList':
                if isinstance(v, (list, tuple)):
                    selt.val_InList = v
    
    def rule_Optional(self, text, rule):
        if self.rule_NotNull(text):
            return rule(text)
        return True
    
    def rule_NotNull(self, text):
        if text and text.strip() != '':
            return True
        return False

    def rule_InList(self, text, values):
        return text in values
    
    def rule_NoSpace(self, text, skip_null_check=False):
        if self.rule_NotNull(text):
            result = re.search('\s+', text)
            return result is None
        else:  # text is null
            return True if skip_null_check else False
    
    def rule_TextMatch(self, text, **kw):
        if 'startswith' in kw:
            return text.startswith(kw['startswith'])
        elif 'endswith' in kw:
            return text.endswith(kw['endsswith'])
        elif 'contains' in kw:
            return kw['contains'] in text

    def rule_ForceFail(self, *args):
        return False

    def rule_ForcePass(self, *args):
        return True

    def rule_ListCheck(self, list_to_chk, func):
        # pdb.set_trace()
        for val in list_to_chk:
            if not func(val):
                return False
        return True

    def rule_TypeCheck(self, element, types):
        return isinstance(element, types)