<?php
header('Content-type: application/json');
echo file_get_contents('http://www.giantbomb.com/api/' . $_GET['resource'] . '/?api_key=0ee00ac84477d4185a6e192fccfdd652efd28408&' . http_build_query($_GET));