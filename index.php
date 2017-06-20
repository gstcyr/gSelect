<!doctype html>
<html>
<head>
    <script type="application/javascript" src="gSelect.js"></script>
    <style type="text/css">
        @import 'gSelect.css';
    </style>
    <script type="application/javascript">
        var sel, msel, tsel;
        window.addEventListener('load', function(){
            sel = new gSelect('testList',{
	            'onChange' : function(val){
		            console.log(val);
	            }
            });
            msel = new gSelect('testSelect',{
	            toggleMode : false,
	            exclusive : true,
	            allGroupSelect : true,
	            'onChange' : function(val){
		            console.log(val);
	            }
            });
            tsel = new gSelect('testSelectToggle',{
	            'onChange' : function(val){
		            console.log(val);
	            }
            });
        });
    </script>

<body>
<table>
<tr>
    <th>Single Select</th>
    <th>Multi Select Standard</th>
    <th>Multi Select Toggle</th>
</tr>
<tr style="vertical-align: top">
<td>
    <ul id="testList" class='gList' tabindex='1'>
        <li value="sometext">Some text</li>
        <li>Another entry</li>
        <li>Test test</li>
        <li>Some text</li>
        <li>Another entry</li>
        <li>Test test</li>
        <li>Some text</li>
        <li>Another entry</li>
        <li>Test test</li>
        <li>Some text</li>
        <li>Another entry</li>
        <li>Test test</li>
        <li>Some text</li>
        <li>Another entry</li>
        <li>Test test</li>
    </ul>
</td>
<td>
    <select id='testSelect' size=15 name='testSelect' multiple >
	    <option value="no">Option Null</option>
<?  for($i=0; $i<40 ; $i++){
		if($i%10==0){
			if($i>0) echo "</optgroup>";
			echo "<optgroup label='Job ".(floor($i/10)+1)."'>";
		}
?>      <option value="<?=$i?>">Option <?=$i?></option>
<?  }
?>  </select>
</td>
<td>
    <select id='testSelectToggle' multiple size=15 name='testSelectToggle' >
	    <option value="no">Option Null</option>
	    <?  for($i=0; $i<40 ; $i++){
		    if($i%10==0){
			    if($i>0) echo "</optgroup>";
			    echo "<optgroup label='Job ".(floor($i/10)+1)."'>";
		    }
		    ?>      <option value="<?=$i?>">Option <?=$i?></option>
	    <?  }
?>  </select>
</td>
<td>
	<select multiple size="15">
		<?  for($i=0; $i<40 ; $i++){
		if($i%10==0){
			if($i>0) echo "</optgroup>";
			echo "<optgroup label='Job ".(floor($i/10)+1)."'>";
		}
		?>      <option value="<?=$i?>">Option <?=$i?></option>
<?  }
?>	</select>
</td>
</tr>
</table>