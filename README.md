# Adventr Realtime Analytics

This is just an initial spike, but as we get more sophisticated, we will update
this README accordingly.

## General Design Strategy

* Static assets hosted on Github Pages
* Authenticates with Adventr API (Django project) and retrieves a Firebase token
* Read-only connection to Firebase
* React components to display analytics, including external components
* Consumes Adventr branding (LESS)
* Built with gulp
