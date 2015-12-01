#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    api.py
    ~~~~~~

    :copyright: (c) 2015 by Anonymous.
    :license: see LICENSE for more details.
"""

class Event(object):
    """Revision history"""
    id = None
    oid = None
    time = None


class Item(object):

    id = None
    title = ""
    body = ""
    created = None
    modified = None # time
    tag = "" # url-safe slug
    creator = "" # email or uid


class Project(object):

    id = None
    oid = None


class Milestone(object):
    """A tagged release"""

    id = None
    oid = None
    tasks = []


class Task(object):
    """A branch"""

    id = None
    oid = None
    steps = []


class Step(object):
    """A rebased feature commit"""

    id = None
    oid = None
    details = []
    # sub-steps? dependencies?

class Detail(object):
    """A commit"""

    id = None
    oid = None
    status = False
    time_est = 0
