#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    __init__.py
    ~~~~~~~~~~~

    :copyright: (c) 2015 by Anonymous.
    :license: see LICENSE for more details.
"""

from flask import render_template, jsonify, request
from flask.views import MethodView


class Base(MethodView):
    def get(self, uri=None):
        template = uri or "index"
        return render_template('base.html', template=template)


class Partial(MethodView):
    def get(self, partial):
        return render_template('partials/%s.html' % partial)


def paginate(page=0, limit=100):
    """Decorator for returning paginated json data"""
    def outer(f):
        def inner(*args, **kwargs):
            _page = request.args.get('page', page)
            _limit = request.args.get('limit', limit)
            start = page * limit
            try:
                r = {'items': f(*args, page=_page, limit=_limit, **kwargs)}
                r['next'] = None if (len(r['items'])) < limit else start + limit + 1
            except Exception as e:
                r = {'error': str(e)}
            r['limit'] = int(_limit)
            r['page'] = int(_page)
            return jsonify(r)
        return inner
    return outer
