#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    todo.py
    ~~~~~~~

    :copyright: (c) 2015 by Anonymous.
    :license: see LICENSE for more details.
"""

from flask import Flask
from flask.ext.routing import router
from flask.ext.cors import CORS
from views import endpoints
import views
from configs import options, cors

urls = ('/api', endpoints,
        '/<path:uri>', views.Base,
        '/', views.Base
        )
app = router(Flask(__name__), urls)
cors = CORS(app) if cors else None

if __name__ == "__main__":
    app.run(**options)
