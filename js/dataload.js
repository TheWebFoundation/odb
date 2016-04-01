	//variables de preproceso para el json de barras y paises
	var columns_data;
	var table_data;
	var map_data;


	//Cargamos los indicadores
	indicators_select = _(window.indicators)
		.filter(function(i) {
			return i.component !== 'CLASSIFICATION' && i.component !== 'DATASET_ASSESSMENT';
		})
		.map(function(i) {
		var type;
		if (!i.index)
			type = 'INDEX';
		else if (!i.subindex)
			type = 'SUBINDEX';
		else if (!i.component)
			type = 'COMPONENT'
		else type = 'INDICATOR';

		return {
			name: i.name,
			indicator: i.indicator,
			type: type
		};
	}).value();


	function refreshData() {
		var year=2015,indicator="",region="",income="",hdirate="";
		if($("#syear").val()!=0) var year = '?_year='+$("#syear").val();
		if($("#sindicator").val()!=0) var indicator = '&indicator='+$("#sindicator").val();
		if($("#sregion").val()!=0) var region = '&region='+$("#sregion").val();
		if($("#sincome").val()!=0) var income = '&income='+$("#sincome").val();
		if($("#shdirate").val()!=0) var hdirate = '&hdirate='+$("#shdirate").val();
		
		var group="";
		var ngroup = $("div.ms-options ul li.selected").length;
		if(ngroup > 0) {
			$("div.ms-options ul li.selected input").each(function() {
				//alert("valor: "+$(this).val());
				group += '&'+$(this).val()+'=1';
			});
		}else{
			var group = "";
		}


		window.location.href = "./"+year+indicator+region+income+hdirate+group;
	}

	function setYear(syear) {
		if(syear!="") {
			$("#syear").val(syear);
		}
	}

	function setIndicators(sindicator) {
		var $selIndicator = $("#sindicator");
		$selIndicator.html('');
		$selIndicator.append('<option value="0">Select ...</option>');
		$.each(indicators_select, function( index, value ) {
			//console.log("indicator: "+value.indicator+" name: "+value.name+" Value: "+value.type);
			var style = "margin-left:0";
			switch(value.type) {
				case "INDEX":
					style = "margin-left:0;";
					break;
				case "SUBINDEX":
					style = "margin-left:10px;font-weight:bold";
					break;
				case "COMPONENT":
					style = "margin-left:20px;font-style:italic;";
					break;
				case "INDICATOR":
					style = "margin-left:30px;";
					break;
				default:
					style = "margin-left:0px;";
					break;
			}
			if(value.indicator == sindicator) { 
				$selIndicator.append('<option value="'+value.indicator+'" style="'+style+'" selected="selected">'+value.name+'</option>');
			}else{
				$selIndicator.append('<option value="'+value.indicator+'" style="'+style+'">'+value.name+'</option>');
			}

			if (sindicator !=0) {
				$("#sindicator").parent().addClass("bg-selected");
			}else{
				$("#sindicator").parent().removeClass("bg-selected");
			}


			// if (option !=0) {
			// 	$(this).parent().parent().addClass("bg-selected");
			// }else{
			// 	$(this).parent().parent().removeClass("bg-selected");
			// }
		});
	}

	function setRegion(sregion) {
		var $selRegion = $("#sregion");
		$selRegion.html('');
		$selRegion.append('<option value="0">All ...</option>');
		$.each(window.regions, function( index, value ) {
			if(value.iso3 == sregion) { 
				$selRegion.append('<option value="'+value.iso3+'" selected="selected">'+value.name+'</option>');
			}else{
				$selRegion.append('<option value="'+value.iso3+'">'+value.name+'</option>');
			}
		});

		if(sregion!=0) {
			$("#sregion").parent().addClass("bg-selected");
		}else{
			$("#sregion").parent().removeClass("bg-selected");
		}
	}

	function setIncome(sincome) {
		if(sincome!=0) {
			$("#sincome").val(sincome);
			$("#sincome").parent().addClass("bg-selected");
		}else{
			$("#sincome").parent().removeClass("bg-selected");
		}
	}

	function setHdiRate(shdirate) {
		if(shdirate!=0) {
			$("#shdirate").val(shdirate);
			$("#shdirate").parent().addClass("bg-selected");
		}else{
			$("#shdirate").parent().removeClass("bg-selected");
		}
	}

	function setGroup(g20,g7,oecd,iodch) {
		if(g20 !=0) $("#sgroup option[value='G20']").attr("selected","selected");
		if(g7 !=0) $("#sgroup option[value='G7']").attr("selected","selected");
		if(oecd !=0) $("#sgroup option[value='OECD']").attr("selected","selected");
		if(iodch !=0) $("#sgroup option[value='IODCH']").attr("selected","selected");
	}



$(document).ready(function() {
 	
	// function processAjaxData(response, urlPath){
	//      document.getElementById("content").innerHTML = response.html;
	//      document.title = response.pageTitle;
	//      window.history.pushState({"html":response.html,"pageTitle":response.pageTitle},"", urlPath);
	//  }

	//Controlamos lo que nos pasan por variables
	function getUrlVars() {
    	var vars = {};
    	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        	vars[key] = value;
    	});
    	return vars;
	}

	var year = getUrlVars()["_year"];
	var indicator = getUrlVars()["indicator"];
	var region = getUrlVars()["region"];
	var income = getUrlVars()["income"];
	var hdirate = getUrlVars()["hdirate"];
	var G20 = getUrlVars()["G20"];
	var G7 = getUrlVars()["G7"];
	var OECD = getUrlVars()["OECD"];
	var IODCH = getUrlVars()["IODCH"];
	//var text = getUrlVars()["text"];

	if(region == undefined || region == "") region = 0;
	if(income == undefined || income == "") income = 0;
	if(G20 == undefined || G20 == "") G20 = 0;
	if(G7 == undefined || G7 == "") G7 = 0;
	if(OECD == undefined || OECD == "") OECD = 0;
	if(IODCH == undefined || IODCH == "") IODCH = 0;

	if(hdirate == undefined || hdirate == "") hdirate = 0;

	if(!$.isNumeric(year)) year = 2015;

	if(year == undefined || indicator == undefined || year == "" || indicator == "") {
		//Aplicar esto sino se pasan parametros..
		if(year == undefined || year == "") year = 2015;
		if(indicator == undefined || indicator == "") indicator = "ODB";
		//Manipulamos el estado con el indicador :-m
		window.history.pushState("", "ODB, Open Data Barometer", "?_year="+year+"&indicator="+indicator+"");
		
	}
	//console.log("Año :"+year+" Indicator: "+indicator);
	
	var selected_year = year;
	var selected_indicator =indicator;
	var selected_indicator_name = _.find(window.indicators, {indicator:selected_indicator}).name;
	var selected_indicator_source = _.find(window.indicators, {indicator:selected_indicator}).source_name;
	var selected_indicator_source_url = _.find(window.indicators, {indicator:selected_indicator}).source_url;
	var selected_indicator_average;
	var selected_indicator_range = _.find(window.indicators, {indicator:selected_indicator}).range;
	var selected_indicator_range_min = selected_indicator_range.substr(0, selected_indicator_range.indexOf("-"));
	var selected_indicator_range_max = selected_indicator_range.substr(selected_indicator_range.indexOf("-")+1, selected_indicator_range.length);
	var number_of_countries;
	var series = [];
	var indicators_select;

	var filtered_data;
	var filtered_table_data;

	//Cargamos los selects
	setYear(year);
	setIndicators(indicator);
	setRegion(region);
	setIncome(income);
	setHdiRate(hdirate);
	setGroup(G20,G7,OECD,IODCH);
	

	//Buscadores
	$(".cbtn-search-home-select").on("click", function(){
		//var option = $(this).parent().parent().find("option:selected").val();
		refreshData();
	});


	var options = {
        url: 'json/countries.json',
        theme: "none",
        //getValue: "character",
        getValue: function(element) {
            return element.search;
            //console.log("Element: "+element.search);
        },
        template: {
            type: "custom",
            method: function(value,item) {
                return "<div class='country-select-autoc' data-item-id='"+item.iso3+"'><span class='adj-img-flag-ac flag-md flag-country'><img class='adj-img-ca-h img-responsive' src='img/flags/"+item.iso2+".svg'></span> <span class='hddn'>"+value+"</span> <span class='adj-txt-country-autoc'>" + item.name + "</span></div>";
            }
        },
        list: {
            match: {
                enabled: true
            },
            maxNumberOfElements: 15,
            onChooseEvent: function() {
                //var value = $("#cinput-s-country").getSelectedItemData().country;
                var selectedItemId = $(".easy-autocomplete").find("ul li.selected div.country-select-autoc").attr("data-item-id");
                //$("#cinput-s-country").val(value).trigger("change");
                //console.log("ID1: "+selectedItemId);

            },
            onSelectItemEvent: function() {
                var value = $("#cinput-s-country").getSelectedItemData().name;
                $("#cinput-s-country").val(value).trigger("change");

            },
            onKeyEnterEvent: function() {
                var value = $("#cinput-s-country").getSelectedItemData().name;
                $("#cinput-s-country").val(value).trigger("change");

            }
        }
       
    };

    var options_modal = {
        url: 'json/countries.json',
        theme: "none",
        //getValue: "character",
        getValue: function(element) {
            return element.search;
            //console.log("Element: "+element.search);
        },
        template: {
            type: "custom",
            method: function(value,item) {
                return "<div class='country-select-autoc' data-item-id='"+item.iso3+"'><span class='adj-img-flag-ac flag-md flag-country'><img class='adj-img-ca-h img-responsive' src='img/flags/"+item.iso2+".svg'></span> <span class='hddn'>"+value+"</span> <span class='adj-txt-country-autoc'>" + item.name + "</span></div>";
            }
        },
        list: {
            match: {
                enabled: true
            },
            maxNumberOfElements: 10,
            onChooseEvent: function() {
                //var value = $("#cinput-s-country").getSelectedItemData().country;
                var selectedItemId = $(".easy-autocomplete").find("ul li.selected div.country-select-autoc").attr("data-item-id");
                //$("#cinput-s-country").val(value).trigger("change");
                //console.log("ID2: "+selectedItemId);

            },
            onSelectItemEvent: function() {
                var value = $("#cinput-s-country-modal").getSelectedItemData().name;
                $("#cinput-s-country-modal").val(value).trigger("change");

            },
            onKeyEnterEvent: function() {
                var value = $("#cinput-s-country-modal").getSelectedItemData().name;
                $("#cinput-s-country-modal").val(value).trigger("change");

            }
        }
       
    };

    //Búsqueda general
    $("#cinput-s-country").easyAutocomplete(options);
    //Búsqueda en modal
    $("#cinput-s-country-modal").easyAutocomplete(options_modal);



    //Iniciamos el dropdown con checbox...
    $("#sgroup").multiselect({
	    placeholder: 'Choose...'
	});

	

    //Carousel de comparaciones
 	var rmItemCount = 0;
	function dosomething(event) {
		rmItemCount = event.item.count;
		//console.log("quedan: "+rmItemCount);
	}

	$(".cbtn-md-add-country").on("click", function(e) {

		e.preventDefault();
		//console.log("Posicion: "+rmItemCount);

		var ncountry = $(".owl-stage").find(".country-area-empty").length;

		if(ncountry == 1) {
			owl.trigger('remove.owl.carousel', 0); 
		}

		//return false;

		//Clonamos el div inicial y cambiamos los datos
		var $div = $('div.country-item-cloned');
		var $cloned =  $div.clone();

		//console.log("clon4: "+$cloned.attr("class"));

		var $end = $cloned.removeClass('country-item-cloned'),
		$end = $cloned.removeClass('hddn');  
		owl.trigger('add.owl.carousel', $cloned,rmItemCount);
		owl.trigger('refresh.owl.carousel');
		owl.trigger('to.owl.carousel',(rmItemCount-1),[300]);

	})


	var owl =  $('.carousel-countries').owlCarousel({
		loop:false,
		margin:10,
		nav:true,
		dots:true,
		onInitialized: dosomething,
		responsive:{
			0:{
				items:1
			}
		}
	});

	owl.owlCarousel();
	var rmItemOwl = 0; //remove item owl carousel

	owl.on('refreshed.owl.carousel', function(event) {
		rmItemCount = event.item.count;

		if(rmItemCount == 0) {
			owl.trigger('add.owl.carousel', '<div class="country-area-empty r-pos"><div class="no-country-select txt-c"><img src="img/img-world-compare-with.png" class="c-obj"><p class="c-g40 p-s-top txt-l">Select a country ...</p></div></div>',0);
			owl.trigger('refresh.owl.carousel');
		}

		//console.log("quedan: "+rmItemCount);
	});

	owl.on('changed.owl.carousel', function(event) {
		rmItemOwl = event.item.index;
		rmItemCount = event.page.count;
		//console.log("Borramos el item: "+rmItemOwl+", ahora quedan: "+rmItemCount);
	});



	//Borrado de countries en el carousel
	$(".cmodal-d-global").delegate(".md-h-removec","click", function(e){
	//$(".md-h-removec").on("click", function(e) {
		e.preventDefault();
	   //console.log("Borramos el item: "+rmItemOwl+", ahora quedan: "+rmItemCount);
		owl.trigger('remove.owl.carousel', rmItemOwl);
		owl.trigger('refresh.owl.carousel');

	})

	//Iniciamos los tooltips
	$(function () {
		$('[data-toggle="tooltip"]').tooltip();
	})


	//Prueba de iconos de ayuda en cabecera de tabla
	$(".cicon-help").on("click", function(e){
		e.stopPropagation();
		alert("help!");
	})


	//Apertura / cierre del modal detalle de countries
	$(document).delegate(".more-info, .close-cmodal-detail","click", function(e){
	//$(".more-info, .close-cmodal-detail").on("click", function(e){

	   e.preventDefault();

	   if(!$(".cmodal-detail").is(".cmodal-detail-open")) {
			$(".cmodal-detail").addClass("cmodal-detail-open");
			$(".overlay").addClass("overlay-open");
			$("body").addClass("noscroll");
	   }else{
			$(".cmodal-detail").removeClass("cmodal-detail-open");
			$(".overlay").removeClass("overlay-open");
			$("body").removeClass("noscroll");
	   }
	})

	$(".cbtn-expand-table").on("click", function(e){
		e.preventDefault();
		if($(".global-content-indicators").is(".cgi-c-expanded")) {
			$(".global-content-indicators").removeClass("cgi-c-expanded");
			$(".cbtn-expand-table").text("Expand");
		}else{
			$(".global-content-indicators").addClass("cgi-c-expanded");
			$(".cbtn-expand-table").text("Collapse");
		}
	})


	//Cierre presionando esc del modal detalle de countries
	$(document).keyup(function(e) {

		//if (e.keyCode == 13) $('.save').click();     // enter
		if (e.keyCode == 27) {
			//Escape solo para cerrar la ventana de detalle de usuario
			if($(".cmodal-detail").is(".cmodal-detail-open")) {
				$(".cmodal-detail").removeClass("cmodal-detail-open");
				$(".overlay").removeClass("overlay-open");
				$("body").removeClass("noscroll");
			}
		}
	});




	//Preproceso para el json de barras y paises
	var processed_json = new Array(); 

	$(".modal-data").on("click", function(){
		$(this).removeClass("modal-data-visible");
	});
	
	function drawTable(data){
		//seleccionar #table-data -> tbody
		//For each object in data
		var current_row = "";
		var my_table = $("#table-data tbody");
		
		var rank_change;


		for(i=0; i<data.length; i++){

			if(data[i].odb_rank_change!=null){rank_change = data[i].odb_rank_change}else{rank_change = 0} //Antes NA

			if(rank_change<0){
				var rank_print = '<span class="arrow-down"></span> '+ Math.abs(rank_change);
			}else{
				var rank_print = '<span class="arrow-up"></span> ' + rank_change;
				if (rank_change == 0) {
					rank_print = '<span class="txt-xs c-g40">NA</span>';
				}
			}

			//Manipulamos la cifra para estilarla un poco
			if(data[i].odb % 1 != 0){
				var odbRaw = data[i].odb;
				var odbDec = odbRaw.toString().split('.');
				var odbPrint = parseInt(odbDec[0]) + '<span class="txt-xs c-g40">.'+ parseInt(odbDec[1]);
			}else{
				var odbPrint = data[i].odb;
			}

			current_row = current_row + '<tr>' +	
			'<td class="ct-td txt-al p-left-l">' +
					'<span class="flag"><img src="img/flags/' + data[i].iso2 + '.svg" class="img-responsive"></span>' +
					'<span class="ct-country"><span class="">' + data[i].name + '</span> <a href="#" class="txt-s more-info displayb" data-iso="' + data[i].iso3 + '"> See details</a></span>' +
			   '</td>' +
			   '<td class="ct-td txt-c txt-med">' + data[i].odb_rank + '</td>' +
			   '<td class="ct-td txt-c txt-med">' + odbPrint +'</span></td>' +
			   '<td class="ct-td txt-c"><span class="displayib" data-labels="' + data[i].readiness_data_labels + '" data-subindex="readiness" data-sparkline="' + data[i].readiness_data + ' ; column"></span><span class="data-sp data-readiness displayib txt-xl m-left">' + data[i].readiness + '</span></td>' +
			   '<td class="ct-td txt-c"><span class="displayib" data-labels="' + data[i].implementation_data_labels + '" data-subindex = "implementation" data-sparkline="' + data[i].implementation_data + ' ; column"></span><span class="data-sp data-implementation displayib txt-xl m-left">' + data[i].implementation + '</span></td>' +
			   '<td class="ct-td txt-c"><span class="displayib" data-labels="' + data[i].impact_data_labels + '" data-subindex="impact" data-sparkline="' + data[i].impact_data + ' ; column"></span><span class="data-sp data-impact displayib txt-xl m-left">' + data[i].impact + '</span></td>' +
			   '<td class="ct-td txt-c txt-med displayib">' + rank_print + '</td>' +
			'</tr>';
		}
		//console.log(current_row);
		//$("#table-data body").html(current_row);
		my_table.append(current_row);		
	}

	$(function () {
		//INICIO CARGA DE DATOS
		//[{y:107, color:'#FF00FF'}, {y:80, color:'#FF0000'}, {y:20, color:'#00FFFF'}]
		$.getJSON('json/odb_' + selected_year + '.json', function (data) {
			columns_data = _(data.areas)
			.map(function(area, iso3){
				var current_country = _.find(window.countries, {iso3:iso3});
				if(area[selected_indicator] != null){
					return {name:current_country.name, y:area[selected_indicator].value, color:window.regions_colors[_.find(window.regions, {iso3:current_country.area}).name], region:_.find(window.regions, {iso3:current_country.area}).name, region_iso3:_.find(window.regions, {iso3:current_country.area}).iso3, income:current_country.income, hdi:current_country.hdi_rank, iodch:current_country.iodch, oecd:current_country.oecd, g20:current_country.g20, g7:current_country.g7, iso3:current_country.iso3};
				}
			})
			.compact()
			.sortBy("y")
			.reverse()
			.value();

			table_data = _(data.areas)
			.map(function(area, iso3){
				var current_country = _.find(window.countries, {iso3:iso3});
				if(area["ODB"] != null){
					if(selected_year>=2015){
						return {name:current_country.name, selected_indicator_value:area[selected_indicator].value, selected_indicator_rank:area[selected_indicator].rank, odb:area["ODB"].value, odb_rank:area["ODB"].rank, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, hdi:current_country.hdi_rank, income:current_country.income, g20:current_country.g20, g7:current_country.g7, iodch:current_country.iodch, oecd:current_country.oecd, region_iso3:current_country.area, readiness_data:[area["GOVERNMENT_POLICIES"].value, area["GOVERNMENT_ACTION"].value, area["REGULATORY_AND_CIVIL"].value, area["BUSINESS_AND_ENTREPRENEURSHIP"].value], implementation_data:[area["INNOVATION"].value, area["SOCIAL_POLICY"].value, area["ACCOUNTABILITY"].value], impact_data:[area["POLITICAL"].value, area["SOCIAL"].value, area["ECONOMIC"].value], readiness_data_labels:[_.find(window.indicators, {indicator:"GOVERNMENT_POLICIES"}).name, _.find(window.indicators, {indicator:"GOVERNMENT_ACTION"}).name, _.find(window.indicators, {indicator:"REGULATORY_AND_CIVIL"}).name, _.find(window.indicators, {indicator:"BUSINESS_AND_ENTREPRENEURSHIP"}).name], implementation_data_labels:[_.find(window.indicators, {indicator:"INNOVATION"}).name, _.find(window.indicators, {indicator:"SOCIAL_POLICY"}).name, _.find(window.indicators, {indicator:"ACCOUNTABILITY"}).name], impact_data_labels:[_.find(window.indicators, {indicator:"POLITICAL"}).name, _.find(window.indicators, {indicator:"SOCIAL"}).name, _.find(window.indicators, {indicator:"ECONOMIC"}).name]}; 
						/*readiness_data:{policies:area["GOVERNMENT_POLICIES"].value, action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};*/
					}
					else{
						return {name:current_country.name, selected_indicator_value:area[selected_indicator].value, selected_indicator_rank:area[selected_indicator].rank, odb:area["ODB"].value, odb_rank:area["ODB"].rank, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, hdi:current_country.hdi_rank, income:current_country.income, g20:current_country.g20, g7:current_country.g7, iodch:current_country.iodch, oecd:current_country.oecd, region_iso3:current_country.area, readiness_data:[area["GOVERNMENT_ACTION"].value, area["REGULATORY_AND_CIVIL"].value, area["BUSINESS_AND_ENTREPRENEURSHIP"].value], implementation_data:[area["INNOVATION"].value, area["SOCIAL_POLICY"].value, area["ACCOUNTABILITY"].value], impact_data:[area["POLITICAL"].value, area["SOCIAL"].value, area["ECONOMIC"].value], readiness_data_labels:[_.find(window.indicators, {indicator:"GOVERNMENT_ACTION"}).name, _.find(window.indicators, {indicator:"REGULATORY_AND_CIVIL"}).name, _.find(window.indicators, {indicator:"BUSINESS_AND_ENTREPRENEURSHIP"}).name], implementation_data_labels:[_.find(window.indicators, {indicator:"INNOVATION"}).name, _.find(window.indicators, {indicator:"SOCIAL_POLICY"}).name, _.find(window.indicators, {indicator:"ACCOUNTABILITY"}).name], impact_data_labels:[_.find(window.indicators, {indicator:"POLITICAL"}).name, _.find(window.indicators, {indicator:"SOCIAL"}).name, _.find(window.indicators, {indicator:"ECONOMIC"}).name]}; /*readiness_data:{action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};*/
					}
				}
			})
			.compact()
			.sortBy("odb")
			.reverse()
			.value();
			//drawTable(table_data);
			
			


	//Custom Search
	$('#cinput-table-search').keyup(function(){
		  //console.log($(this).val());
		  table.search($(this).val()).draw() ;
	})
	var filter_applied = new Object;
	if(region!=0) filter_applied.region_iso3 = region;
	if(income!=0){ 
		switch(income){
			case "1":filter_applied.income = "Lower middle income";
				   break;
			case "2":filter_applied.income = "Low income";
				   break;
			case "3":filter_applied.income = "High income";
				   break;
			case "4":filter_applied.income = "Upper middle income";
				   break;
		}
	}		
	if(hdirate!=0){
		switch(hdirate){
			case "1":filter_applied.hdi = "Low";
				   break;
			case "2":filter_applied.hdi = "Medium";
				   break;
			case "3":filter_applied.hdi = "High";
				   break;
			case "4":filter_applied.hdi = "Very High";
				   break;
		}
	}	
	if(G20 == 1){filter_applied.g20 = 1};
	if(G7 == 1){filter_applied.g7 = 1};
	if(OECD == 1){filter_applied.oecd = 1};
	if(IODCH == 1){filter_applied.iodch = 1};
			
	
			//console.log(filter_applied);
			filtered_data = _.filter(columns_data, filter_applied);
			filtered_table_data = _.filter(table_data, filter_applied);
			drawTable(filtered_table_data);
			
			//Iniciamos la tabla ordenada por ODB Rank y ODB asc
			var table = $('#table-data').DataTable({
				fixedHeader: true,
				paging: false,
				order: [[1,"asc"], [2,"asc"]],
				//info: false,
				sDom: 't' //Que solo renderice la tabla
				// language: {
				//     search: "_INPUT_",
				//     searchPlaceholder: "Search country ..."
				// }
			});
			/*var countries = _.map(data.areas, function(area, iso3){
				if(area[selected_indicator] != null){
					return _.find(window.countries, {iso3:iso3}).name;
				}
			})*/
			
			map_data = _(data.areas)
			.map(function(area, iso3){
				if(area[selected_indicator] != null){
					return {code:iso3, value:area[selected_indicator].value};
				}
			})
			.compact()
			.value();

			number_of_countries = map_data.length - 1; //(-1 por las estadísticas)
			selected_indicator_average = Math.round(data.stats[selected_indicator].mean*100)/100;

			//$("#ranking-indicator-title").text(selected_indicator_name);


		//FIN CARGA DE DATOS

			//PRUEBA SPARKLINES
			
    $(function () {
    /**
     * Create a constructor for sparklines that takes some sensible defaults and merges in the individual
     * chart options. This function is also available from the jQuery plugin as $(element).highcharts('SparkLine').
     */
    Highcharts.SparkLine = function (a, b, c) {
        var hasRenderToArg = typeof a === 'string' || a.nodeName,
            options = arguments[hasRenderToArg ? 1 : 0],
            defaultOptions = {
                chart: {
                    renderTo: (options.chart && options.chart.renderTo) || this,
                    backgroundColor: null,
                    borderWidth: 0,
                    type: 'column',
                    margin: [2, 0, 2, 0],
                    width: 70,
                    height: 40,
                    style: {
                        overflow: 'visible'
                    },
                    skipClone: true
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    startOnTick: false,
                    endOnTick: false,
                    tickPositions: []
                },
                yAxis: {
                    endOnTick: false,
                    startOnTick: false,
                    min: 0,
					max: 100,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    tickPositions: [0]
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    backgroundColor: null,
                    borderWidth: 0,
                    shadow: false,
                    useHTML: true,
                    hideDelay: 0,
                    shared: true,
                    padding: 0,
                    positioner: function (w, h, point) {
                        return { x: point.plotX - w / 2, y: point.plotY - h };
                    }
                },
                plotOptions: {
                    series: {
                        animation: false,
                        lineWidth: 1,
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        marker: {
                            radius: 1,
                            states: {
                                hover: {
                                    radius: 2
                                }
                            }
                        },
                        fillOpacity: 0.25
                    },
                    column: {
                    	color: '#FFE064',
                        negativeColor: '#910000',
                        borderColor: 'none'
                    }
                }
            };

        options = Highcharts.merge(defaultOptions, options);

        return hasRenderToArg ?
            new Highcharts.Chart(a, options, c) :
            new Highcharts.Chart(options, b);
    };

    var start = +new Date(),
        $spans = $('span[data-sparkline]'),
        fullLen = $spans.length,
        n = 0;

    // Creating 153 sparkline charts is quite fast in modern browsers, but IE8 and mobile
    // can take some seconds, so we split the input into chunks and apply them in timeouts
    // in order avoid locking up the browser process and allow interaction.
    function doChunk() {
        var time = +new Date(),
            i,
            len = $spans.length,
            $span,
            stringdata,
			stringlabels,
			stringsubindex,
			subindex_colors = ["#FFCD00", "#C0F8EC", "#E3C2FF"],
			colums_color,
			labels = new Array(),
            arr,
            data,
            chart;

        for (i=0; i<len; i++) {
            $span = $($spans[i]);
            stringlabels = $span.data('labels');
            stringsubindex = $span.data('subindex');
			stringdata = $span.data('sparkline');
			arr = stringdata.split('; ');
			labels = [" "];
			labels = labels.concat(stringlabels.split(','));
			switch(stringsubindex){
				case "readiness": 	  colums_color = subindex_colors[0];
									  break; 
				case "implementation":colums_color = subindex_colors[1];
									  break; 
				case "impact":        colums_color = subindex_colors[2];
									  break; 
			}
		
			//var labels = new Function("return [" + stringlabels + "];")();
			//var labels = (new Function("return [" + stringlabels+ "];")());
			//console.log(labels);
            data = $.map(arr[0].split(','), parseFloat);
			//console.log(data);
			//labels = $.map(stringlabels.split(','));
            chart = {};

            if (arr[1]) {
                chart.type = arr[1];
            }
            $span.highcharts('SparkLine', {
                series: [{
                    data: data,
                    color:colums_color,
                    pointStart: 1
                }],
				xAxis: {
				   type: 'category',
				   // minRange: 1,
					categories: labels//countries,
					/*labels: {
						enabled:false
					}*/
				},
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">{point.x}:</span>',
                    pointFormat: '<b>{point.y}</b>'
                },
                chart: chart
            });

            n += 1;

            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 500) {
                $spans.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }

            // Print a feedback on the performance
            //if (n === fullLen) {
            //    $('#result').html('Generated ' + fullLen + ' sparklines in ' + (new Date() - start) + ' ms');
            //}
        }
    }
    doChunk();

});
			//FIN PRUEBA SPARKLINES
			
			
			
			
			function pointClick() {
				//alert("Pais: "+this.name+ " | D.Población: "+this.value); 

				if(!$(".modal-data").is(".modal-data-visible")) {
					$(".modal-data").addClass("modal-data-visible");
					$(".data-ciudad").html(this.name+" ("+this.code+")");
					$(".data-poblacion").html(this.value);
				}else{
					$(".data-ciudad").html(this.name+" ("+this.code+")");
					$(".data-poblacion").html(this.value);
				}

			// 	$div = $(".grafica");

			// 	window.chart = new Highcharts.Chart({

			// 		chart: {
			// 			renderTo: $div[0],
			// 			type: 'column',
			// 			width: 280,
			// 			height: 240,
			// 			backgroundColor: null,
			// 			borderWidth: 0,
			// 			type: 'column',
			// 			//margin: [2, 0, 2, 0],
			// 			width: 290,
			// 			height: 120,
			// 			style: {
			// 				overflow: 'visible'
			// 			}
			// 		},
			// 		title: {
			// 			text: null
			// 		},
			// 		credits: {
			// 			enabled: false
			// 		},
			// 		xAxis: {
			// 			labels: {
			// 				enabled: false
			// 			},
			// 			title: {
			// 				text: null
			// 			},
			// 			startOnTick: false,
			// 			endOnTick: false,
			// 			tickPositions: []
			// 		},
			// 		yAxis: {
			// 			endOnTick: false,
			// 			startOnTick: false,
			// 			labels: {
			// 				enabled: false
			// 			},
			// 			title: {
			// 				text: null
			// 			},
			// 			tickPositions: [0]
			// 		},
			// 		legend: {
			// 			enabled: false
			// 		},
			// 		series: [{
			// 			name: 'Population',
			// 			data: [{
			// 				name: 'Min population knowing',
			// 				color: '#79B042',
			// 				y: 3
			// 			}, {
			// 				name: 'Population of '+this.name,
			// 				color: '#FFE064',
			// 				y: this.value
			// 			}],
			// 			dataLabels: {
			// 				format: '<b>{point.name}</b> {point.percentage:.1f}% out of 100%'
			// 			},
			// 			column: {
			// 				borderColor: 'silver'
			// 			}
			// 		}]

			// 	});

			}

			// Propiedades gráfico del mapa
			$('#wrapper-map').highcharts('Map', {

				chart: {
					backgroundColor: 'transparent',
					margin: 0
				},
				title: {
					text: ''
				},
				tooltip: {
					  //enabled:false,
					  //name: 'Densidad de población',
				},  
				legend: {
					title: {
						text: selected_indicator_name,
						style: {
							color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
						}
					}
				},
				mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        theme: {
                            fill: 'white',
                            'stroke-width': 0,
                            stroke: 'silver',
                            r: 0,
                            states: {
                                hover: {
                                    fill: '#79B042'
                                },
                                select: {
                                    stroke: '#039',
                                    fill: '#bada55'
                                }
                            }
                        },
                        verticalAlign: 'bottom'
                    },
                    enableMouseWheelZoom: false,
                    buttons: {
                        zoomIn: {
                            y:-25,
                            x: 20
                        },
                        zoomOut: {
                            y: 5,
                            x: 20
                        }
                    }
                },	            

/*
				tooltip: {
					backgroundColor: 'none',
					borderWidth: 0,
					shadow: false,
					useHTML: true,
					padding: 0,
					pointFormat: '<span class="f32"><span class="flag {point.flag}"></span></span>' +
						' {point.name}: <b>{point.value}</b>/km²',
					positioner: function () {
						return { x: 0, y: 250 };
					}
				}
,*/

				colorAxis: {
					min: selected_indicator_range_min,
					max: selected_indicator_range_max,
					//type: 'logarithmic',
					maxColor: "#495E32",
					minColor: "#A8CF7C"
				},
				series : [{
					data : map_data,
					mapData: Highcharts.maps['custom/world'],
					joinBy: ['iso-a3', 'code'], //cambiar a iso-a3 con los datos del ODB
					name: selected_indicator_name,
					borderColor :"rgba(84, 199, 252, 0.2)",
					states: {
						hover: {
							color: '#F8E71C'
						}
					},
					point: {
						events: {
							//click: pointClick
						}
					}
				}]
			});
			
			// Fin propiedades Mapa
			
			// Propiedades gráfico de barras

			 $('#column-graph').highcharts({
				chart: {
					type: 'column',
					backgroundColor: 'transparent',
					zoomType: 'x',
					renderTo: 'column-graph',
					resetZoomButton: {
		                theme: {
		                    fill: 'white',
		                    stroke: 'none',
		                    r: 0,
		                    states: {
		                        hover: {
		                            fill: '#79B042',
		                            stroke: 'none',
		                            style: {
		                                color: 'white'
		                            }
		                        }
		                    }
		                }
		            }
				},
				title: {
					text: selected_indicator_name
				},
				subtitle: {
					text: 'Source: <a href="' + selected_indicator_source_url + '">' + selected_indicator_source + '</a>'
				},
				xAxis: {
				   type: 'category',
				   // minRange: 1,
					categories: data.name,//countries,
					labels: {
						rotation: -45,
						style: {
							fontSize: '9px',
							fontFamily: 'Arial, sans-serif'
						}
					},
					//min:0,
					max: filtered_data.length - 1//number_of_countries
				},
				scrollbar: {
					enabled: true,
					barBackgroundColor: '#79B042',
	                barBorderRadius: 7,
	                barBorderWidth: 0,
	                buttonBackgroundColor: '#79B042',
	                buttonBorderWidth: 0,
	                buttonBorderRadius: 7,
	                trackBackgroundColor: '#EAEAEA',
	                trackBorderWidth: 0,
	                trackBorderRadius: 8,
	                trackBorderColor: '#CCC',
	                buttonArrowColor: 'white',
	                rifleColor: 'white',
				},
				yAxis: {
					min: selected_indicator_range_min,
					max: selected_indicator_range_max,
					//categories: ['data.value'],
					title: {
						text: null
					},
					plotLines: [{
						color: '#000000',//'#79b042',
						//dashStyle: 'shortdash',
						width: 1,
						value: selected_indicator_average, // average here
						zIndex: 4, // To not get stuck below the regular plot lines
						label: {
							text: 'Average (' + selected_indicator_average + ')',
							align: 'right'
						}
					}]
				},
				legend: {
					enabled: false
				},
				tooltip: {
					pointFormat: selected_indicator_name + ': <b>{point.y:.1f}</b>'
				},
				series: [{
					name: selected_indicator_name,
					data: filtered_data, //columns_data,
					dataLabels: {
						enabled: true,
						rotation: -75,
						color: '#333333',
						align: 'left',
						format: '{point.y:.1f}', // one decimal
						y: -1, // 10 pixels down from the top
						style: {
							fontSize: '8px',
							fontFamily: 'Arial, sans-serif'
						}
					}
				}]/*,
				plotOptions: {
					column: {
						grouping: false,
						shadow: false
					}
				}*/
			});

		});

	});

});