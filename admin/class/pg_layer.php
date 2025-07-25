<?php		
    class pg_layer_Class extends layer_Class
    {		
				function __construct($dbconn, $owner_id) {
						parent::__construct($dbconn, $owner_id, 'layer', 'pg');
				}

        function create($data)
        {
					$row_id = parent::create($data);
					if($row_id == 0){
						return 0;
					}
					
            $sql = "INSERT INTO PUBLIC." .$this->table_ext.'_'.$this->table_name." (id,tbl,geom) VALUES('".
							$row_id."','".
							$this->cleanData($data['tbl'])."','".
							$this->cleanData($data['geom'])."') RETURNING id";
             
							$result = pg_query($this->dbconn, $sql);
							if(!$result){
								$this->delete($row_id);
								return 0;
							}
							pg_free_result($result);
							return $row_id;
        }

       function update($data=array())
       {
				 parent::update($data);
				 
          $sql = "update public.".$this->table_ext.'_'.$this->table_name." set ".
					" tbl='".$this->cleanData($data['tbl']).
					"', geom='".$this->cleanData($data['geom']).
					"' where id = '".intval($data['id'])."'";
					
					$result = pg_query($this->dbconn, $sql);
					if($result) {
						$rv = (pg_affected_rows($result) > 0);
						pg_free_result($result);

						return $rv;
					}
					return false;
       }
	}
?>
