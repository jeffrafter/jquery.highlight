Highlight
=========

Description
-----------
Allows a container or window to be highlighted by dimming the surrounding
area. You can include a message to instruct the user on what to do next.

License
-------
Licensed under the MIT: http://www.opensource.org/licenses/mit-license.php

Usage
-----

    <script type="text/javascript" src="js/jquery.highlight.min.js"></script>

    <input name="title" value="" id="title">

    <script type="text/javascript">
      $('#title').highlight({
        message: "Don't forget to fill this out"
      })
    </script>

Available options
-----------------
* `message`: The message that appears in the info window for the user.
* `position`: Where the message will be placed in relation to the focused element. Possible options include ('above', 'below') default is 'below'.
* `class`: A class you might want added to the message (optional).

Requirements
------------

* [jQuery 1.3+](http://download.jquery.com)

Copyright
---------
Copyright 2014 Hunter Bridges, Mike Kavouras, Jeff Rafter

