function crearTabla()
{
	var ajax_data =
	[
		{dia:"---", dispositivo:"---", encendido:"---", apagado:"---"}, 
	]

	   var random_id = function  () 
	{
		var id_num = Math.random().toString(9).substr(2,3);
		var id_str = Math.random().toString(36).substr(2);
		
		return id_num + id_str;
	}
	
	var tbl = '';
	tbl +='<table class="table table-hover tbl_code_with_mark">'

		//--->create table header > start
		tbl +='<thead>';
			tbl +='<tr>';
			tbl +='<th data-colname="dia" data-order="desc">Dia &#9650</th>';
			tbl +='<th data-colname="dispositivo" data-order="desc">Toma &#9650</th>';
			tbl +='<th data-colname="encendido" data-order="desc">encendido &#9650</th>';
			tbl +='<th data-colname="apagado" data-order="desc">apagado &#9650</th>';
			tbl +='<th  data-colname="options" data-order="desc">Options</th>';
			tbl +='</tr>';
		tbl +='</thead>';
		//--->create table header > end

		
		//--->create table body > start
		tbl +='<tbody>';

			//--->create table body rows > start
			$.each(ajax_data, function(index, val) 
			{
				//you can replace with your database row id
				var row_id = random_id();

				//loop through ajax row data
				tbl +='<tr row_id="'+row_id+'">';
					tbl +='<td ><div class="row_data" edit_type="click" col_name="dia">'+val['dia']+'</div></td>';
					tbl +='<td ><div class="row_data" edit_type="click" col_name="dispositivo">'+val['dispositivo']+'</div></td>';
					tbl +='<td ><div class="row_data" edit_type="click" col_name="encendido">'+val['encendido']+'</div></td>';
					tbl +='<td ><div class="row_data" edit_type="click" col_name="apagado">'+val['apagado']+'</div></td>';

					//--->edit options > start
					tbl +='<td>';
					 
						tbl +='<span class="btn_edit" > <a href="#" class="btn btn-link " row_id="'+row_id+'" > Edit</a> </span>';

						//only show this button if edit button is clicked
						tbl +='<span class="btn_save"> <a href="#" class="btn btn-link"  row_id="'+row_id+'"> Save</a> | </span>';
						tbl +='<span class="btn_cancel"> <a href="#" class="btn btn-link" row_id="'+row_id+'"> Cancel</a> | </span>';
						tbl +='<a href="#" class="btn_delete btn btn-link1 text-danger" row_id="'+row_id+'"> Delete</a>';
					tbl +='</td>';
					//--->edit options > end
					
				tbl +='</tr>';
			});

			//--->create table body rows > end

		tbl +='</tbody>';
		//--->create table body > end

	tbl +='</table>'	
	//--->create data table > end


		//add new table row
		
		tbl +='<div class="text-center">';
			tbl +='<span class="btn btn-primary btn_new_row" id="guardar">guardar en memoria</span>';
		tbl +='<div>';
		

//out put table data
$(document).find('.tbl_user_data').html(tbl);
$(document).find('.btn_save').hide();
$(document).find('.btn_cancel').hide();
$(document).find('.btn_delete').hide(); 
};
crearTabla();

//--->make div editable > start
$(document).on('click', '.row_data', function(event) 
{
	event.preventDefault(); 

	if($(this).attr('edit_type') == 'button')
	{
		return false; 
	}

	//make div editable
	$(this).closest('div').attr('contenteditable', 'true');
	//add bg css
	$(this).addClass('bg-warning').css('padding','5px');

	$(this).focus();
})	
//--->make div editable > end

//--->save single field data > start
$(document).on('focusout', '.row_data', function(event) 
{
	event.preventDefault();

	if($(this).attr('edit_type') == 'button')
	{
		return false; 
	}

	var row_id = $(this).closest('tr').attr('row_id'); 
	
	var row_div = $(this)			
	.removeClass('bg-warning') //add bg css
	.css('padding','')

	var col_name = row_div.attr('col_name'); 
	var col_val = row_div.html(); 

	var arr = {};
	arr[col_name] = col_val;

	//use the "arr"	object for your ajax call
	$.extend(arr, {row_id:row_id});

	//out put to show
	$('.post_msg').html( '<pre class="bg-success">'+JSON.stringify(arr, null, 2) +'</pre>');
	
})	
//--->save single field data > end



//--->button > edit > start	
$(document).on('click', '.btn_edit', function(event) 
{
	event.preventDefault();
	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');

	tbl_row.find('.btn_save').show();
	tbl_row.find('.btn_cancel').show();
	tbl_row.find('.btn_delete').show();

	//hide edit button
	tbl_row.find('.btn_edit').hide(); 

	//make the whole row editable
	tbl_row.find('.row_data')
	.attr('contenteditable', 'true')
	.attr('edit_type', 'button')
	.addClass('bg-warning')
	.css('padding','3px')

	//--->add the original entry > start
	tbl_row.find('.row_data').each(function(index, val) 
	{  
		//this will help in case user decided to click on cancel button
		$(this).attr('original_entry', $(this).html());
	}); 		
	//--->add the original entry > end

});
//--->button > edit > end


 //--->button > cancel > start	
$(document).on('click', '.btn_cancel', function(event) 
{
	event.preventDefault();

	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');

	//hide save and cacel buttons
	tbl_row.find('.btn_save').hide();
	tbl_row.find('.btn_cancel').hide();
	tbl_row.find('.btn_delete').hide(); 

	//show edit button
	tbl_row.find('.btn_edit').show();

	//make the whole row editable
	tbl_row.find('.row_data')
	.attr('edit_type', 'click')	 
	.removeClass('bg-warning')
	.css('padding','') 

	tbl_row.find('.row_data').each(function(index, val) 
	{   
		$(this).html( $(this).attr('original_entry') ); 
	});  
});
//--->button > cancel > end

 //--->button > delete > start
	$(document).on('click', '.btn_delete', function(event) 
	{
		event.preventDefault();

		var ele_this = $(this);
		var row_id = ele_this.attr('row_id');
		var data_obj=
		{
			call_type:'delete_row_entry',
			row_id:row_id,
		};	
		 		 
		ele_this.html('<p class="bg-warning">Please wait....deleting your entry</p>')
		ele_this.closest('tr').css('background','red').slideUp('slow');
	});
//--->button > delete > end



//--->save whole row entery > start	
$(document).on('click', '.btn_save', function(event) 
{
	event.preventDefault();
	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');

	
	//hide save and cacel buttons
	tbl_row.find('.btn_save').hide();
	tbl_row.find('.btn_cancel').hide();
	tbl_row.find('.btn_delete').hide();

	//show edit button
	tbl_row.find('.btn_edit').show();


	//make the whole row editable
	tbl_row.find('.row_data')
	.attr('edit_type', 'click')	
	.removeClass('bg-warning')
	.css('padding','') 

	//--->get row data > start
	var arr = {}; 
	tbl_row.find('.row_data').each(function(index, val) 
	{   
		var col_name = $(this).attr('col_name');  
		var col_val  =  $(this).html();
		arr[col_name] = col_val;
	});
	//--->get row data > end

	//use the "arr"	object for your ajax call
	$.extend(arr, {row_id:row_id});

	//out put to show
	$('.post_msg').html( '<pre class="bg-success">'+JSON.stringify(arr, null, 2) +'</pre>')
	 

});
//--->save whole row entery > end
//--->crear nuevo renglon > start
//$(document).trigger( "click",'#crear' );
$(document).on('click', '#crear', function(event) 
{
	event.preventDefault();
	//get table rows
	var tbl_row = $(document).find('.tbl_code_with_mark').find('tr');	 
		var tbl = '';
	$.each(ajax_data_test, function(index, val) 
			{
	//create a random id
	var row_id = Math.random().toString(36).substr(2);

	

	tbl +='<tr row_id="'+row_id+'">';
		tbl +='<td ><div class="row_data" contenteditable="true" edit_type="click" col_name="dia">'+val['dia']+'</div></td>';
		tbl +='<td ><div class="row_data" contenteditable="true" edit_type="click" col_name="dispositivo">'+val['dispositivo']+'</div></td>';
		tbl +='<td ><div class="row_data" contenteditable="true" edit_type="click" col_name="encendido">'+val['encendido']+'</div></td>';
		tbl +='<td ><div class="row_data" contenteditable="true" edit_type="click" col_name="apagado">'+val['apagado']+'</div></td>';

		//--->edit options > start
	tbl +='<td>';
					 
						tbl +='<span class="btn_edit" > <a href="#" class="btn btn-link " row_id="'+row_id+'" > Edit</a> </span>';

						//only show this button if edit button is clicked
						tbl +='<span class="btn_save"> <a href="#" class="btn btn-link"  row_id="'+row_id+'"> Save</a> | </span>';
						tbl +='<span class="btn_cancel"> <a href="#" class="btn btn-link" row_id="'+row_id+'"> Cancel</a> | </span>';
						tbl +='<a href="#" class="btn_delete btn btn-link1 text-danger" row_id="'+row_id+'"> Delete</a>';
					tbl +='</td>';
		//--->edit options > end	

	tbl +='</tr>';
	});
	tbl_row.last().after(tbl);
	$(document).find('.btn_save').hide();
	$(document).find('.btn_cancel').hide();
	$(document).find('.btn_delete').hide(); 

	$(document).find('.tbl_code_with_mark').find('tr').last().find('.dia').focus();
	ajax_data_test=[];
});





//--->crear nuevo renglon > end

	$(document).on('click', '.btn_remove_new_entry', function(event) 
	{
		event.preventDefault();

		$(this).closest('tr').remove();
	});


//-->confirmar nuevo renglon >start
	
$(document).on('click', '.btn_save', function(event) 
{
	event.preventDefault();
	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');

	
	//hide save and cacel buttons
	tbl_row.find('.btn_save').hide();
	tbl_row.find('.btn_cancel').hide();
	tbl_row.find('.btn_delete').hide();

	//show edit button
	tbl_row.find('.btn_edit').show();


	//make the whole row editable
	tbl_row.find('.row_data')
	.attr('edit_type', 'click')	
	.removeClass('bg-warning')
	.css('padding','') 

	//--->get row data > start
	var arr = {}; 
	tbl_row.find('.row_data').each(function(index, val) 
	{   
		var col_name = $(this).attr('col_name');  
		var col_val  =  $(this).html();
		arr[col_name] = col_val;
	});
	//--->get row data > end

	//use the "arr"	object for your ajax call
	$.extend(arr, {row_id:row_id});

	//out put to show
	$('.post_msg').html( '<pre class="bg-success">'+JSON.stringify(arr, null, 2) +'</pre>')
	 

});

//--->confirmar nuevo renglon > end


//--->ordenar elementos tabla >start
 $('th').on('click', function(){
     var column = $(this).data('colname')
     var order = $(this).data('order')
     var text = $(this).html()
     text = text.substring(0, text.length - 1);
     
     
     
     if (order == 'desc'){
        myArray = myArray.sort((a, b) => a[column] > b[column] ? 1 : -1)
        $(this).data("order","asc");
        text += '&#9660'
     }else{
        myArray = myArray.sort((a, b) => a[column] < b[column] ? 1 : -1)
        $(this).data("order","desc");
        text += '&#9650'
     }

    $(this).html(text)
    buildTable(myArray)
    })
//--->ordenar elementos tabla>end


$("table tr").each(function(i, v)
{
	$(this).children('td').each(function(ii,vv)
	{
		try{console.log($(vv.children[0].attributes["col_name"].value))}
		catch(error)
		{console.log("no existe")}
	})
})
