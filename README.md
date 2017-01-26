# tkt-easy
Simple Ticket &amp; Story Management for small project(s)

# Backgroud

This is by no means tool that can replace Jira or something similar tools. My idea behind this tool was to have a very 
simple Ticket & Story management tool which can be launched from the web page i am working on!. I started something small
and after a week or 2, i ended up creating this, i think, this tool is generic enough to be used by others.

This is based on Python 3 and my favorite web framework **Flask**

# Setup

1. Install all modules from `requirement.txt`
2. Run the application by `python app/__init__.py`
3. Check the `localhost:14000/api`

# Integrate with your app

1. Add a launch button in common layout.html or something similar
2. Add "window.open()" event handler, which would open ticket website in window.

# TODO

1. Add basic user authentication & User signups
2. Some bugs
