#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
endpoints.py
~~~~~~~~~~~~

:copyright: (c) 2015 by Anonymous.
:license: see LICENSE for more details.
"""

from flask import request
from flask.views import MethodView
from api import Item
from views import paginate

class Tasks(MethodView):

    @paginate()
    def get(self, uri=None, page=1, limit=50):
        return []

    def post(self):
        title = request.form.get('title', '')
        return title


class Task(MethodView):
    def get(self, tid):
        return jsonify({"task": {}})


urls = (
    '/tasks/<tid>', Task,
    '/tasks', Tasks
)
