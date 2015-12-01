from flask import jsonify

def paginate(page=1, limit=100):
    """A Flask decorator for returning paginated json API data"""
    def outer(f):
        def inner(*args, **kwargs):
            _page = request.args.get('page', page)
            _limit = request.args.get('limit', limit)
            try:
                r = f(*args, page=_page, limit=_limit, **kwargs)
                r['next'] = int(r['start']) + int(_limit)
            except Exception as e:
                r = {'error': str(e), 'ids': []}
            r['limit'] = int(_limit)
            r['page'] = int(_page)
            return r
        return inner
    return outer

def rest_api(f):
    def inner(*args, **kwargs):
        try:
            j = jsonify(f(*args, **kwargs))
            j['status'] = 200
        except Exception as e:
            j['status'] = 500
            j['error'] = str(e)
        return j
