	//Funcion para recoger las variables de la URL
	function getUrlVars() {
    	var vars = {};
    	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        	vars[key] = value;
    	});
    	return vars;
	}

	//variables de preproceso para el json de barras y paises
	var columns_data;
	var table_data;
	var map_data;
	var filtered_data_map;
	var ctrIsoCompare = [];
	var country_data;
	var selected_year;
	var selected_indicator;
	var selected_indicator_name;
	var selected_indicator_source;
	var selected_indicator_average;
	var selected_indicator_range;
	var selected_indicator_range_min;
	var selected_indicator_range_max;
	var number_of_countries;
	var series = [];
	var indicators_select;
	var filtered_data;
	var filtered_table_data;
	var country_odb_series;
	var country_readiness_series;
	var country_implementation_series;
	var country_impact_series;
	var country_datasets = {};
	var country_years_series;
	var loaded_countries = [];
    var loaded_countries_data = {}; //Objeto que contiene los datos de los países por iso3, cargado de json/odb_ISO3.json para cada país.
    var carousel_current_country = 0;
    var year;
    var noDataYear = 0;

Array.prototype.remove = function() {
    //Añado el método remove a la clase Array para borrar posiciones de un array por su valor.
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}


	var $div = $("#wrapper-pspider");
	var polarOptions = {
			credits: {
					enabled:false
				},
	        chart: {
	            polar: true,
	            type: 'line',
	            backgroundColor:'transparent',
	            renderTo: $div[0],
	        },

	        title: {
	            text: '',
	            //x: -80
	        },

	        pane: {
	            size: '70%'
	        },

	        xAxis: {
	            //categories: country_data[0].components_data_labels,
	            tickmarkPlacement: 'on',
	            lineWidth: 0
	        },

	        yAxis: {
	            gridLineInterpolation: 'polygon',
	            lineWidth: 0,
	            min: 0
	        },

	        tooltip: {
	            shared: true,
	            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
	        },

	        legend: {
	            align: 'center',
	            verticalAlign: 'bottom',
	            //y: 70,
	            layout: 'horizontal'
	        },

	        series: [{
	            //name: country_data[0].name,
	            //data: country_data[0].components_data,//[80, 25, 90, 100, 73, 29, 45, 24, 31, 10],
	            pointPlacement: 'on',
	            color: '#7ED321'
	        }]
	    };


	var base_URL = window.location.href;
	$("meta[property='og:url']").attr("content", base_URL);

	if (base_URL.indexOf("&open") !== -1) {
		base_URL = base_URL.substring(0, base_URL.lastIndexOf("&open"));
		//console.log("URL actual: "+base_URL);
	}

	if (base_URL.indexOf("?_year") === -1) {
		base_URL = base_URL+'?_year=2015&indicator=ODB';
		//console.log("URL actual: "+base_URL);
	}




	var countriesURL = getUrlVars()["comparew"];
	if(countriesURL !== undefined){

		if(countriesURL.lastIndexOf("%2C")) {
			countriesURL = decodeURIComponent(countriesURL);
		}

		var ctrIsoCompare = countriesURL.split(",");
		//var base_URL_OM = fullURL.substring(0, fullURL.lastIndexOf("&open"))+'&open=';
		//var fullURL =  window.location.href;
		//var base_URL_OM = fullURL.substring(0, fullURL.lastIndexOf("&open"))+'&open=';
		//var base_URL_OM = base_URL.substring(0, base_URL.lastIndexOf("&open"))+'&open=';
	}else{
		var ctrIsoCompare = [];
		//var base_URL_OM = window.location.href+'&open='; //current url con la modal abierta
		//var base_URL_OM = base_URL+'&open='; //current url con la modal abierta
	}

	//Iniciamos el carousel
 	var rmItemCount = 0;
	function initCont(event) {
		rmItemCount = event.item.count;
		//console.log("quedan: "+rmItemCount);
	}

	var owl =  $('.carousel-countries').owlCarousel({loop:false,margin:10,nav:true,dots:true,onInitialized: initCont,responsive:{0:{items:1}}});

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
		year=2015;
		var indicator="",region="",income="",hdirate="";
		if($("#syear").val()!=0)year = '?_year='+$("#syear").val();
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

	var cont_filters = 0;

	function setYear(syear) {
		if(syear!="") {
			$("#syear").val(syear);
			$("#syear-modal").val(syear);
			//$("#syear").parent().addClass("bg-selected");
		}else{
			//$("#syear").parent().removeClass("bg-selected");
		}
	}

	function setIndicators(sindicator) {
		var $selIndicator = $("#sindicator");
		var $selIndicatorm = $("#sindicator-modal");
		$selIndicator.html('');
		$selIndicatorm.html('');
		//$selIndicator.append('<option value="0">Select ...</option>');
		$.each(indicators_select, function( index, value ) {
			//console.log("indicator: "+value.indicator+" name: "+value.name+" Value: "+value.type);
			var style = "margin-left:0";
			var sp = "";
			switch(value.type) {
				case "INDEX":
					//style = "margin-left:0;";
					break;
				case "SUBINDEX":
					//style = "margin-left:10px;font-weight:bold";
					sp = "&nbsp;&nbsp;&nbsp;&nbsp;";

					break;
				case "COMPONENT":
					//style = "margin-left:20px;font-style:italic;";
					sp = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					break;
				case "INDICATOR":
					//style = "margin-left:30px;";
					sp = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					break;
				default:
					//style = "margin-left:0px;";
					sp = "";
					break;
			}

			if(value.indicator == sindicator) {
				$selIndicator.append('<option value="'+value.indicator+'" style="'+style+'" selected="selected">'+sp+value.name+'</option>');
				$selIndicatorm.append('<option value="'+value.indicator+'" style="'+style+'" selected="selected">'+sp+value.name+'</option>');
			}else{
				$selIndicator.append('<option value="'+value.indicator+'" style="'+style+'">'+sp+value.name+'</option>');
				$selIndicatorm.append('<option value="'+value.indicator+'" style="'+style+'">'+sp+value.name+'</option>');
			}

			if (sindicator !=0) {
				//$("#sindicator").parent().addClass("bg-selected");
			}else{
				//$("#sindicator").parent().removeClass("bg-selected");
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
			cont_filters++;
		}else{
			$("#sregion").parent().removeClass("bg-selected");
		}
	}

	function setIncome(sincome) {
		if(sincome!=0) {
			$("#sincome").val(sincome);
			$("#sincome").parent().addClass("bg-selected");
			cont_filters++;
		}else{
			$("#sincome").parent().removeClass("bg-selected");
		}
	}

	function setHdiRate(shdirate) {
		if(shdirate!=0) {
			$("#shdirate").val(shdirate);
			$("#shdirate").parent().addClass("bg-selected");
			cont_filters++;
		}else{
			$("#shdirate").parent().removeClass("bg-selected");
		}
	}

	function setGroup(g20,g7,oecd,iodch) {
		if(g20 !=0) $("#sgroup option[value='G20']").attr("selected","selected");
		if(g7 !=0) $("#sgroup option[value='G7']").attr("selected","selected");
		if(oecd !=0) $("#sgroup option[value='OECD']").attr("selected","selected");
		if(iodch !=0) $("#sgroup option[value='IODCH']").attr("selected","selected");

		if(g20 !=0 || g7 !=0 || oecd !=0 || iodch !=0 ) {
			$("#sgroup").parent().addClass("bg-selected");
			cont_filters++;
		}else{
			$("#sgroup").parent().removeClass("bg-selected");
		}
	}

function drawNewCountryChart(idISO){
    //Metemos la gráfica del nuevo país
	//$.getJSON('json/odb_' + idISO + '.json', function (data) {
		var added_country = loaded_countries_data[idISO];
		var new_country_odb_series = _.map(added_country.years, function(year){ return year.observations.ODB.value;});
		var new_country_readiness_series = _.map(added_country.years, function(year){ return year.observations.READINESS.value;});
		var new_country_implementation_series = _.map(added_country.years, function(year){ return year.observations.IMPLEMENTATION.value;});
		var new_country_impact_series = _.map(added_country.years, function(year){ return year.observations.IMPACT.value;});
		var new_country_years_series = _.keys(added_country.years);

	window.chart = new Highcharts.Chart({
		credits: {
					enabled:false
				},
		chart: {
			renderTo: $graph[0],
        	type:'line',
			height: 300,
			backgroundColor: null,
			borderWidth: 0,
		},
		title: {
        	text: '',
        	//x: -20 //center
        },
        subtitle: {
            text: '',
            //x: -20
        },
        xAxis: {
            categories: new_country_years_series
        },
        yAxis: {
            title: {
                text: ''
            },
            min: 0,
			max: 100
        },
        tooltip: {
            valueSuffix: ''
        },
        legend: {
        	width:'100%',
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        series: [{
            name: 'Readiness',
            data: new_country_readiness_series,
            color:'#F1C40F'
	        }, {
	            name: 'Implementation',
	            data: new_country_implementation_series,
	            color:'#92EFDA'
	        }, {
	            name: 'Impact',
	            data: new_country_impact_series,
	            color:'#CB97F9'
	        },{
	            name: 'ODB',
	            data: new_country_odb_series,
	            color:'#000'
        }]

    });
}
function setCountryDataset(iso3){
	//Recibe un código iso3 de un país
	//carga en la posición "iso3" de country_datasets los datos para el dataset del país dado.
		// Datos seleccionados
		var	selected_year_datasets = loaded_countries_data[iso3].years[selected_year].datasets;
		// Obtener los nombres de meta indicadores que tienen que ver con dataset
		var dataset_indicators_meta = _(indicators_meta).filter({component: 'DATASET_ASSESSMENT'}).map('indicator').value();
		dataset_indicators_meta.push("VALUE");
		country_datasets[iso3] = _.zipObject(dataset_indicators_meta, _.map(dataset_indicators_meta, function(meta_indicator) {
			return _.zipObject(_.keys(selected_year_datasets), _.map(selected_year_datasets, _.property(meta_indicator)));
		}));
	//});
}

function datasetCountryRow(iso3, num_country, compare){
	//Recibe el código de país (iso3), la posición del país en la tabla del dataset (1 ó 2), y si estamos comparando con otro país (0 ó 1).
	//Devuelve el html de la fila con la info principal del país.
	var rowstring;
	var cdata = _.filter(table_data, {iso3:iso3});
	var svgFlag = cdata[0].iso2;
	rowstring = '<tr class="cb-bottom-lh">' +
		'<td class="ctd-md"><span class="flag-md-small flag-country"><img src="img/flags/' + svgFlag.toLowerCase() + '.svg" class="adj-img-ca-h img-responsive"></span> <span class="displaib m-left-xs">' + cdata[0].name + '</span></td>';
		if(compare){
		rowstring = rowstring + '	<td class="ctd-md txt-c uppc txt-s">c' + num_country + '</td>';
		}
		_.each(country_datasets[iso3].VALUE, function(value, key){
			if (country_datasets[iso3].ISOPEN[key] == 0){
				rowstring = rowstring + '	<td class="ctd-md txt-c"><span class="data-i data-i-incomp txt-s" title="' + _.find(window.countries, {iso3:iso3}).name + " - " + _.find(window.indicators, {indicator:key}).name + ': ' + _.find(window.indicators_meta, {indicator:"ISOPEN"}).name + ' NO - Dataset Quality: ' + value + ' (out of 100)" data-toggle="tooltip">' + value + '</span></td>';
			}
			else{
				rowstring = rowstring + '	<td class="ctd-md txt-c"><span class="data-i data-i-comp txt-s" title="' + _.find(window.countries, {iso3:iso3}).name + " - " + _.find(window.indicators, {indicator:key}).name + ': ' + _.find(window.indicators_meta, {indicator:"ISOPEN"}).name + ' YES - Dataset Quality: ' + value + ' (out of 100)" data-toggle="tooltip">' + value + '</span></td>';
			}
	});
	rowstring = rowstring + '</tr>';
	return rowstring;
}

function datasetValuesRow(iso3, indicator, value, num_country, compare){
	var rowstring = '<tr class="cb-bottom-lh">';
				if(num_country==1){
					if(compare){
						rowstring =  rowstring + '	<td rowspan="2" class = "ctd-md uppc txt-s">' + _.find(window.indicators_meta, {indicator:indicator}).name + '  </td>';
					}
					else{
						rowstring =  rowstring + '	<td class = "ctd-md uppc txt-s">' + _.find(window.indicators_meta, {indicator:indicator}).name + '  </td>';
					}
				}
				if(compare){
					rowstring =  rowstring + '	<td class="ctd-md txt-c uppc txt-s">c' + num_country + '</td>';
				}
					_.each(value, function(v, k){
						//DEPENDIENDO DEL VALOR DE key
						var clase_celda;
						if(indicator != "GUPDATED"){
							if(v<=0){
								clase_celda = "data-i-incomp";
							}
							else {
								clase_celda = "data-i-comp";
							}
						}
						else{
							if(v==-5){
								clase_celda = "data-i-incomp";
							}
							else if(v==0){
								clase_celda = "data-i-updated";
							}
							else{
								clase_celda = "data-i-comp";
							}
						}
						//Si quisiéramos un tooltip  title=" Country1: ' + _.find(window.indicators_meta, {indicator:key}).name + '" data-toggle="tooltip"
						rowstring =  rowstring + '	<td class="ctd-md txt-c" ><span class="data-i-round ' + clase_celda + '" title="' + _.find(window.countries, {iso3:iso3}).name + ' - ' + _.find(window.indicators, {indicator:k}).name + ': ' + _.find(window.indicators_meta, {indicator:indicator}).name + '" data-toggle="tooltip"></span></td>';
					});
					rowstring =  rowstring + '</tr>';
	return rowstring;
}

function drawDatasetTable(){
	//Recibe dos códigos iso3 países
		var countryHeader1 = "";
		var countryHeader2 = "";
		var datasetRow1 = "";
		var datasetRow2 = "";
		var tableImplementation = '<thead>' +
		'	<tr class="cb-bottom-2">' +
		'		<th class="cth-md uppc txt-s c-g40 fwlight">Dataset scored</th>';
		if(loaded_countries.length>1){
			tableImplementation = tableImplementation + '		<th class="cth-md txt-c uppc txt-xs">Acron.</th>';
		}
		_.each(country_datasets[loaded_countries[0]].VALUE, function(value, key){
		tableImplementation = tableImplementation + '		<th class="cth-md txt-c"><img src="img/clusters/' + key + '.png" width="16" height="16" alt="' + _.find(window.indicators, {indicator:key}).name + '" title="' + _.find(window.indicators, {indicator:key}).name + '" data-toggle="tooltip" data-placement="top"></th>'
		});

		tableImplementation = tableImplementation + '</tr>' + '</thead>' + '<tbody>';
		if(loaded_countries.length>1){
			countryHeader1 = datasetCountryRow(loaded_countries[0], 1, 1);
			countryHeader2 = datasetCountryRow(loaded_countries[carousel_current_country], 2, 1);
		}
		else{
			countryHeader1 = datasetCountryRow(loaded_countries[0], 1, 0);
		}
		tableImplementation = tableImplementation + countryHeader1 + countryHeader2;
		_.each(country_datasets[loaded_countries[0]], function(value, key){
			if((key!="ISOPEN") && (key!="VALUE")){
				if(loaded_countries.length>1){
					datasetRow1 = datasetValuesRow(loaded_countries[0], key, value, 1, 1);
					datasetRow2 = datasetValuesRow(loaded_countries[carousel_current_country], key, country_datasets[loaded_countries[1]][key], 2, 1);
				}
				else{
					datasetRow1 = datasetValuesRow(loaded_countries[0], key, value, 1, 0);
				}
				tableImplementation = tableImplementation + datasetRow1 + datasetRow2;
			}
		});
		tableImplementation = tableImplementation + '</tbody>';

		$("#cm-table-implementation").html(tableImplementation);
		//Iniciamos los tooltips
		$(function () {
			$('[data-toggle="tooltip"]').tooltip();
		})
}


function drawModal() {
	country_data = _.filter(table_data, {iso3:loaded_countries[0]});
    //console.log(loaded_countries[0]);
	var g20_class;
	var g7_class;
	var iodch_class;
	var oecd_class;

	if(country_data[0].g7) {g7_class = "cicon-check c-check";} else g7_class = "cicon-cross txt-s c-error";
	if(country_data[0].g20) {g20_class = "cicon-check c-check";} else g20_class = "cicon-cross txt-s c-error";
	if(country_data[0].iodch) {iodch_class = "cicon-check c-check";} else iodch_class = "cicon-cross txt-s c-error";
	if(country_data[0].oecd) {oecd_class = "cicon-check c-check";} else oecd_class = "cicon-cross txt-s c-error";

	rank_change = country_data[0].odb_rank_change;

	if (rank_change == null) {
		rank_print = '<span class="txt-xxs cprimary uppc">New</span>';
	}else{
		if(rank_change<0){
			var rank_print = '<span class="arrow-down"></span> '+ Math.abs(rank_change);
		} else {
			var rank_print = '<span class="arrow-up"></span> ' + rank_change;
			if(rank_change == 0) {
				rank_print = '<span class="txt-xs c-g40">0</span>';
			}
		}
	}

	//Manipulamos la cifra para estilarla un poco
	if(country_data[0].odb % 1 != 0){
		var odbRaw = country_data[0].odb;
		var odbDec = odbRaw.toString().split('.');
		var odbPrint = parseInt(odbDec[0]) + '<span class="txt-xs c-g40">.'+ parseInt(odbDec[1]);
	}else{
		var odbPrint = country_data[0].odb;
	}

	var headerModal = '<div class="container-fluid">' +
				'	<div class="row">' +
				'		<div class="col-md-12 txt-c p-xs-top p-s-bottom">' +
				'			<div class="cm-h-item cm-h-tit fleft txt-al displayib">' +
				'				<h4 class="no-m-bottom txt-l">' +
				'					<span class="flag-md-header"><img src="img/flags/' + country_data[0].iso2.toLowerCase() + '.svg" class="img-responsive"></span>' +
				'					<span class="ct-country"><span class="txt-m">' + country_data[0].name + '</span> <span class="txt-s c-g40 more-info displayb">' + country_data[0].region + '</span></span>' +
				'				</h4>' +
				' 			</div>' +
				'			<div class="cm-h-item cm-h-rdata fleft displayib">' +
				'				<ul class="ilist overfh displayib txt-al">' +
				'					<li class="il-item"><label class="uppc txt-s c-g40 p-s-top">Income</label><span class="displayb cinput-txt">' + country_data[0].income + '</span></li>' +
				'					<li class="il-item p-left-l"><label class="uppc txt-s c-g40 p-s-top">HDI Rank</label><span class="displayb cinput-txt">' + country_data[0].hdi + '</span></li>' +
				'					<li class="il-item p-left-l"><label class="uppc txt-s c-g40 p-s-top">G20</label><span class="displayb cinput-txt"><span class="' + g20_class + '"></span></span></li>' +
				'					<li class="il-item p-left-l"><label class="uppc txt-s c-g40 p-s-top">G7</label><span class="displayb cinput-txt"><span class="' + g7_class + '"></span></span></li>' +
				'					<li class="il-item p-left-l"><label class="uppc txt-s c-g40 p-s-top">OECD</label><span class="displayb cinput-txt txt-c"><span class="' + oecd_class + '"></span></span></li>' +
				'					<li class="il-item p-left-l"><label class="uppc txt-s c-g40 p-s-top">IODCH</label><span class="displayb cinput-txt txt-c"><span class="' + iodch_class + '"></span></span></li>' +
				'				</ul>' +
				'			</div>' +
				'				<div class="cm-h-item cm-h-acc fright txt-ar p-s-top m-xs-top">'+
				'				<button class="ctn-icon cbtn-share"><span class="cicon-share txt-xl displayb"></span><span class="uppc txt-xs">share</span></button>'+
				'				<button class="ctn-icon close-cmodal-detail"><span class="cicon-cross txt-xl displayb"></span> <span class="uppc txt-xs">close</span></button>'+
				'			</div>'+
				'		</div>'+
				'	</div>'+
				'</div>'+
				'<div class="cm-h-data-resume bg-section p-s-top p-s-bottom">'+
				'	<div class="container-fluid">'+
				'		<div class="row">'+
				'			<div class="col-md-12 txt-c">'+
				'				<ul class="ilist overfh displayib ">'+
				'					<li class="il-item-resp"><label class="uppc txt-xs c-g40 p-s-top">ODB Rank</label><span class="displayb cinput-txt txt-med m-xs-top">' + country_data[0].odb_rank + '</span></li>'+
				'					<li class="il-item-resp"><label class="uppc txt-xs c-g40 p-s-top">ODB</label><span class="displayb cinput-txt txt-med m-xs-top">' + odbPrint + '</span></li>'+
				'					<li class="il-item-resp"><label class="uppc txt-xs c-g40 p-s-top">Readiness</label>'+
				'						<span class="displayb m-s-top">'+
				'							<span class="displayib" data-labels="' + country_data[0].readiness_data_labels + '" data-subindex="readiness" data-sparkline="' + country_data[0].readiness_data + ' ; column"></span><span class="data-sp data-readiness displayib txt-xl m-left">' + country_data[0].readiness + '</span>'+
				'						</span>'+
				'					</li>'+
				'					<li class="il-item-resp"><label class="uppc txt-xs c-g40 p-s-top">Implementation</label>'+
				'						<span class="displayb m-s-top">'+
				'							<span class="displayib" data-labels="' + country_data[0].implementation_data_labels + '" data-subindex="implementation" data-sparkline="' + country_data[0].implementation_data + ' ; column"></span><span class="data-sp data-implementation displayib txt-xl m-left">' + country_data[0].implementation + '</span>'+
				'						</span>'+
				'					</li>'+
				'					<li class="il-item-resp"><label class="uppc txt-xs c-g40 p-s-top">Impact</label>'+
				'						<span class="displayb m-s-top">'+
				'							<span class="displayib" data-labels="' + country_data[0].impact_data_labels + '" data-subindex="impact" data-sparkline="' + country_data[0].impact_data + ' ; column"></span><span class="data-sp data-impact displayib txt-xl m-left">' + country_data[0].impact + '</span>'+
				'						</span>'+
				'					</li>'+
				'					<li class="il-item-resp" class="displayb"><label class="uppc txt-xs c-g40 p-s-top">ODB Rank change</label><span class="displayb cinput-txt txt-med m-xs-top">' + rank_print + '</span></li>'+
				'				</ul>'+
				'			</div>'+
				'		</div>'+
				'	</div>'+
				'</div>';

	$("#cm-header").html(headerModal);

	var indicator_percentage = (parseInt(country_data[0].selected_indicator_value) * 100) / parseInt(selected_indicator_range_max);
	var svgFlag = country_data[0].iso2;
	var contentModal = '<header class="ca-header txt-c">' +
						'		<h5 class="txt-al no-m-top no-m-bottom displayib c-obj">' +
						'			<span class="flag-md flag-country"><img src="img/flags/' + svgFlag.toLowerCase() + '.svg" class="adj-img-ca-h img-responsive"></span>' +
						'			<span class="ca-h-tit displayib m-xs-top">' + country_data[0].name +
						'			 <span class="displayb uppc txt-s m-xs-top c-g40">' + selected_year + '</span>' +
						'			</span>' +
						'		</h5>' +
						'</header>' +
						'<div class="static-indicator r-pos">' +
						'	<h5 class="txt-m displayb si-tit-current">' + selected_indicator_name + '<span class="displayib fright txt-xl si-val-current">' + country_data[0].selected_indicator_value + '</span></h5>' +
						'	<div class="indicator-cover">' +
						'		<div class="indicator-progress i-p-current" style="width:' + indicator_percentage + '%"></div>' +
						'	</div>' +
						'	<span class="indicator-st i-init txt-s c-g40">' + selected_indicator_range_min + '</span><span class="indicator-st i-end txt-s c-g40">' + selected_indicator_range_max + '</span>' +
						'</div>' +
						'<div class="ca-content ca-current m-xl-top txt-c">' +
						'	<div id ="grafica-modal"></div>' +
						'	<!--img src="img/ie-graphic-country.png" class="c-obj p-xxl-top"-->' +
						'</div>';
	$("#country-selected").html(contentModal);
	//CARGA DE DATOS DEL DETALLE PAÍS
	//$.getJSON('json/odb_' + loaded_countries[0] + '.json', function (data) {

        var firstCountryData = loaded_countries_data[loaded_countries[0]];
        //console.log(loaded_countries[0]);
        //console.log(firstCountryData);

		country_odb_series = _.map(firstCountryData.years, function(year){ return year.observations.ODB.value;});
		country_readiness_series = _.map(firstCountryData.years, function(year){ return year.observations.READINESS.value;});
		country_implementation_series = _.map(firstCountryData.years, function(year){ return year.observations.IMPLEMENTATION.value;});
		country_impact_series = _.map(firstCountryData.years, function(year){ return year.observations.IMPACT.value;});
		country_years_series = _.keys(firstCountryData.years);

		//setCountryDataset(loaded_countries[0]);

	    drawDatasetTable();


	//Fin Implementation
	//Impact
	//Fin Impact


		//_.reduce(data.years, function(result, value, key){result[key:]},{});
		//$("#grafica-modal").highcharts({
		var $div_linechart = $("#grafica-modal");
		var country_odb_chart = {
			credits: {
					enabled:false
				},
			chart: {
					height: 300,
					backgroundColor: null,
					borderWidth: 0,
					type: 'line',
					renderTo: $div_linechart[0]
				},
				title: {
	            	text: '',
	            	//x: -20 //center
		        },
		        subtitle: {
		            text: '',
		            //x: -20
		        },
		        xAxis: {
		            categories: country_years_series//['2013', '2014', '2015']
		        },
		        yAxis: {
		            title: {
		                text: ''
		            },
		            min: 0,
					max: 100
		        },
		        /*tooltip: {
		            valueSuffix: ''
		        },*/
		        legend: {
		        	width:'100%',
		            layout: 'horizontal',
		            align: 'center',
		            verticalAlign: 'bottom',
		            borderWidth: 0
		        },
		        series: [{
		            name: 'Readiness',
		            data: country_readiness_series,
		            color:'#F1C40F'
		        }, {
		            name: 'Implementation',
		            data: country_implementation_series,
		            color:'#92EFDA'
		        }, {
		            name: 'Impact',
		            data: country_impact_series,
		            color:'#CB97F9'
		        },{
		            name: 'ODB',
		            data: country_odb_series,
		            color:'#000'
		        }]
		    };

			chart_country = new Highcharts.Chart(country_odb_chart);

		    //Generamos las categorias e iniciamos la grafica polar
		    polarOptions.xAxis.categories = country_data[0].components_data_labels;
		    polarOptions.series[0].name = country_data[0].name;
	    	polarOptions.series[0].data = country_data[0].components_data;
		    chart_init = new Highcharts.Chart(polarOptions);

		    //Añadimos la serie
		    // chart_init.addSeries({
	    	// 	name: country_data[0].name,
	    	// 	data: country_data[0].components_data
	    	// });

	    	//polarOptions.xAxis.categories = country_data[0].components_data_labels;

			/*$(".si-val-current").text(selected_indicator_average);
			$(".i-p-current").css("width",selected_indicator_average);

			$(".i-init ").text(selected_indicator_range_min);
			$(".i-end ").text(selected_indicator_range_max);*/

	//});


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
			$spans = $('.cmodal span[data-sparkline]'),
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
				subindex_colors = ["#FFCD00", "#6DF5D7", "#BE8FE7"],
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
						categories: labels,//countries,
						lineColor:colums_color
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

	//Agregamos los paises a comparar si tenemos paises
	if(ctrIsoCompare.length != 0) {
        ctrIsoCompare.forEach(function(iso3c) {
            $.getJSON('json/odb_' + iso3c + '.json', function(data){
                loaded_countries_data[iso3c] = data;
                loaded_countries.push(iso3c);
                //Este igual se puede quitar ya
                //ctrIsoCompare.push(iso3c);
                //-----
                carousel_current_country = 1;//loaded_countries.length-1;
                setCountryDataset(iso3c);
                drawModalCountryComp(iso3c,0);
                //Clonamos el pais
                addCountrySpider();
                drawDatasetTable();
                owl.trigger('refresh.owl.carousel');
            });
        });

    }else{
    	var OwlIsEmpty = $("div.owl-item div.country-area-empty").length;
    	if(OwlIsEmpty == 0) {
    		owl.trigger('add.owl.carousel', '<div class="country-area-empty r-pos"><div class="no-country-select txt-c"><img src="img/img-world-compare-with.png" class="c-obj"><p class="c-g40 p-s-top txt-l">Select a country ...</p></div></div>',0);
			owl.trigger('refresh.owl.carousel');
		}
    }

    $(".cm-source-data").text(selected_indicator_source);
    $(".cm-source-data").attr("href",selected_indicator_source_url);

	setTimeout(function(){
	 	//console.log(loaded_countries);
	 	drawIndicatorsTableModal();
	},750)
    
}


function drawModalCountryComp (idISO,intro) {

	//Clonamos el div inicial y cambiamos los datos
	var $div = $('div.country-item-cloned');
	var $cloned =  $div.clone();
	var new_country_data = _.filter(table_data, {iso3:idISO});
    // console.log(table_data);
    // console.log(idISO);
    // console.log(_.filter(table_data, {iso3:idISO}));
	var indicator_percentage = (parseInt(new_country_data[0].selected_indicator_value) * 100) / parseInt(selected_indicator_range_max);
	var svgFlag = new_country_data[0].iso2;

	var $end = $cloned.removeClass('country-item-cloned'),
	$end = $cloned.removeClass('hddn'),
	$end = $cloned.attr("data-id",idISO),
	$end = $cloned.find("span.md-h-removec").attr("data-id",idISO),
	$end = $cloned.find("img.adj-img-ca-h").attr("src","img/flags/" + svgFlag.toLowerCase() + ".svg"),
	$end = $cloned.find("span.ca-h-tit").text(new_country_data[0].name),
	$end = $cloned.find("span.ca-h-indicator-name").text(selected_indicator_name),
	$end = $cloned.find("span.ca-h-indicator-value").text(new_country_data[0].selected_indicator_value),
		$end = $cloned.find("span.ca-h-indicator-init").text(selected_indicator_range_min),
		$end = $cloned.find("span.ca-h-indicator-end").text(selected_indicator_range_max),
	$end = $cloned.find("div.ca-h-indicator-progress").css("width",indicator_percentage+"%");
	$graph = $cloned.find("div.grafica-modal-compare");


	owl.trigger('add.owl.carousel', $cloned,rmItemCount);
	owl.trigger('refresh.owl.carousel');
	if(intro == 1) {
		owl.trigger('to.owl.carousel',(rmItemCount-1),[300]);
	}

    drawNewCountryChart(idISO);
//});
}


function addCountrySpider() {

	//alert(isoCountry);

	country_data_add = _.filter(table_data, {iso3:loaded_countries[carousel_current_country]});
		//Generamos la serie
		//console.log("add polar to "+country_data_add[0].name);

		chart_init = new Highcharts.Chart(polarOptions);
	    chart_init.addSeries({
	    	name: country_data_add[0].name,
	    	data: country_data_add[0].components_data,
	    	color: '#D0021B'
	    });
	    //chart_add.redraw();
	    //polarOptions.addSeries.data = country_data[0].components_data;
	    //chart_clone = new Highcharts.Chart(polarOptions);
}


function drawIndicatorsTableModal(){
	
	//console.log("year: "+year+" country base: "+loaded_countries[0]);
	var selected_year = year;

	$(".gci-c-readliness").removeClass("cgi-c-nodata");
	$(".gci-c-impact").removeClass("cgi-c-nodata");

	//Readiness
	var readiness_indicators = _(indicators).filter(function(value, key){ return value.subindex==='READINESS' && value.component!==null;}).map('indicator').reverse().value();
	var readiness_name = _(indicators).filter(function(value, key){ return value.subindex==='READINESS' && value.component!==null;}).map('name').reverse().value();
	//Impact
	var impact_indicators = _(indicators).filter(function(value, key){ return value.subindex==='IMPACT' && value.component!==null;}).map('indicator').reverse().value();
	var impact_name = _(indicators).filter(function(value, key){ return value.subindex==='IMPACT' && value.component!==null;}).map('name').reverse().value();
	


	//Cargamos el country 0 - modal
	var selected_country = loaded_countries[0];
	var cdata = _.filter(table_data, {iso3:selected_country});
	//Readiness
	var thead_readiness = '<th class="cth-md uppc txt-s c-g40 fwlight" >Country</th>';
	var tbody_readiness = '<td class="ctd-md"><span class="flag-md-small flag-country"><img src="img/flags/' + cdata[0].iso2.toLowerCase() + '.svg" class="adj-img-ca-h img-responsive"></span> <span class="displaib m-left-xs">' + cdata[0].name + '</span></td>';
	$.each(readiness_indicators, function (index,indicator) {
		//console.log("year: "+indicator);
		if(loaded_countries_data[selected_country].years[selected_year].observations[indicator]!=null && loaded_countries_data[selected_country].years[selected_year].observations[indicator].value!=null) {
			thead_readiness += '<th class="cth-md txt-c uppc"><span class="cicon-info txt-xl click" data-toggle="tooltip" data-placement="bottom" data-original-title="'+readiness_name[index]+'"></span></th>';
			if(loaded_countries_data[selected_country].years[selected_year].observations[indicator].value!=null) {
				tbody_readiness += '<td class="ctd-md txt-c">'+loaded_countries_data[selected_country].years[selected_year].observations[indicator].value.toFixed(2)+'</td>';
			}else{
				tbody_readiness += '<td class="ctd-md txt-c"> -- </td>';
			}
		}
	});
	$("table#cm-table-readliness thead tr").html(thead_readiness);
	$("table#cm-table-readliness tbody tr:first").html(tbody_readiness);

	//Impact
	var thead_impact = '<th class="cth-md uppc txt-s c-g40 fwlight" >Country</th>';
	var tbody_impact = '<td class="ctd-md"><span class="flag-md-small flag-country"><img src="img/flags/' + cdata[0].iso2.toLowerCase() + '.svg" class="adj-img-ca-h img-responsive"></span> <span class="displaib m-left-xs">' + cdata[0].name + '</span></td>';
	$.each(impact_indicators, function (index,indicator) {
		if(loaded_countries_data[selected_country].years[selected_year].observations[indicator]!=null) {
			thead_impact += '<th class="cth-md txt-c uppc"><span class="cicon-info txt-xl click" data-toggle="tooltip" data-placement="bottom" data-original-title="'+impact_name[index]+'"></span></th>';
			if(loaded_countries_data[selected_country].years[selected_year].observations[indicator].value!=null) {
				tbody_impact += '<td class="ctd-md txt-c">'+loaded_countries_data[selected_country].years[selected_year].observations[indicator].value.toFixed(2)+'</td>';
			}else{
				tbody_impact += '<td class="ctd-md txt-c"> -- </td>';
			}
		}
	});
	$("table#cm-table-impact thead tr").html(thead_impact);
	$("table#cm-table-impact tbody tr:first").html(tbody_impact);

	//console.log("Countries: "+selected_country);

	if(loaded_countries.length > 1) {
		//Cargamos los datos del item actual del carousel
		//console.log("aqui");
		var selected_country = loaded_countries[carousel_current_country];
		var cdata = _.filter(table_data, {iso3:selected_country});

		//Readiness
		var tbody_readiness_add = '<td class="ctd-md"><span class="flag-md-small flag-country"><img src="img/flags/' + cdata[0].iso2.toLowerCase() + '.svg" class="adj-img-ca-h img-responsive"></span> <span class="displaib m-left-xs">' + cdata[0].name + '</span></td>';
		$.each(readiness_indicators, function (index,indicator) {
			if(loaded_countries_data[selected_country].years[selected_year].observations[indicator]!=null) {
				if(loaded_countries_data[selected_country].years[selected_year].observations[indicator].value !=null) {
					tbody_readiness_add += '<td class="ctd-md txt-c">'+loaded_countries_data[selected_country].years[selected_year].observations[indicator].value.toFixed(2)+'</td>';
				}else {
					tbody_readiness_add += '<td class="ctd-md txt-c"> -- </td>';
				}
			}
		});
		$("table#cm-table-readliness tbody tr:last").html(tbody_readiness_add);

		//Impact
		var tbody_impact_add = '<td class="ctd-md"><span class="flag-md-small flag-country"><img src="img/flags/' + cdata[0].iso2.toLowerCase() + '.svg" class="adj-img-ca-h img-responsive"></span> <span class="displaib m-left-xs">' + cdata[0].name + '</span></td>';
		$.each(impact_indicators, function (index,indicator) {
			if(loaded_countries_data[selected_country].years[selected_year].observations[indicator]!=null) {
				if(loaded_countries_data[selected_country].years[selected_year].observations[indicator].value!=null) {
					tbody_impact_add += '<td class="ctd-md txt-c">'+loaded_countries_data[selected_country].years[selected_year].observations[indicator].value.toFixed(2)+'</td>';
				}else{
					tbody_impact_add += '<td class="ctd-md txt-c"> -- </td>';
				}
			}
		});
		$("table#cm-table-impact tbody tr:last").html(tbody_impact_add);
	}

	//Reiniciamos tooltips
	$(function () {
		$('[data-toggle="tooltip"]').tooltip();
	});

}

//Funcion generica para abrir el modal de country recibiendo como parámetro la iso3 del pais
function OpenCountryData (isoData) {
	var country = isoData;
	loaded_countries.push(country);
	if(getUrlVars()["open"]===undefined) {
		base_URL_OM = base_URL+"&open="+country;
		window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM);
	}else{
		base_URL_OM = base_URL+"&open="+country;
	}
    //cargo el json del primer país
    $.getJSON('json/odb_' + country + '.json', function(data){
        loaded_countries_data[country] = data;
        setCountryDataset(country);
        //Solo necesitamos unos milisegundos
       	drawModal();
       	showModal();
    });
}

function showModal() {
	
	if(!$(".cmodal-detail").is(".cmodal-detail-open")) {
		$(".cmodal-detail").addClass("cmodal-detail-open");
		$(".overlay").addClass("overlay-open");
		$("body").addClass("noscroll");
	}else{
		$(".cmodal-detail").removeClass("cmodal-detail-open");
		$(".overlay").removeClass("overlay-open");
		$("body").removeClass("noscroll");
		window.history.pushState("", "ODB, Open Data Barometer",base_URL);

	    //Reiniciamos la variables:
	    ctrIsoCompare = [];
	    base_URL_OM = window.location.href+'&open=';
	   	loaded_countries = [];

	    //Vaciamos el carousel
	    owl.trigger('replace.owl.carousel', '<div class="country-area-empty r-pos"><div class="no-country-select txt-c"><img src="img/img-world-compare-with.png" class="c-obj"><p class="c-g40 p-s-top txt-l">Select a country ...</p></div></div>',0);
		owl.trigger('refresh.owl.carousel');
		$("table#cm-table-readliness tbody tr:last").html("");
		$("table#cm-table-impact tbody tr:last").html("");
	}
}


function openModalAdv (msg) {

	if($(".cmodal-detail").is(".cmodal-detail-open")) {
		$(".cmodal-detail").css("opacity",0.2);
	}

	if(!$(".cmodal-handsup").is(".cmodal-handsup-open")) {
		$(".msg-cm-hu").text(msg);
		$(".cmodal-handsup").addClass("cmodal-handsup-open");
		$(".overlay").addClass("overlay-open");
		$("body").addClass("noscroll");
	}else{
		$(".msg-cm-hu").text("...");
		$(".cmodal-handsup").removeClass("cmodal-handsup-open");
		$(".overlay").removeClass("overlay-open");
		$("body").removeClass("noscroll");
	}
}



$(document).ready(function() {

year = getUrlVars()["_year"];
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

selected_year = year;
selected_indicator = indicator;
selected_indicator_name = _.find(window.indicators, {indicator:selected_indicator}).name;
selected_indicator_source = _.find(window.indicators, {indicator:selected_indicator}).source_name;
selected_indicator_source_url = _.find(window.indicators, {indicator:selected_indicator}).source_url;
selected_indicator_range = _.find(window.indicators, {indicator:selected_indicator}).range;
selected_indicator_range_min = selected_indicator_range.substr(0, selected_indicator_range.indexOf("-"));
selected_indicator_range_max = selected_indicator_range.substr(selected_indicator_range.indexOf("-")+1, selected_indicator_range.length);

//Cargamos los selects
setYear(year);
setIndicators(indicator);
setRegion(region);
setIncome(income);
setHdiRate(hdirate);
setGroup(G20,G7,OECD,IODCH);


//Cargamos el contador de filtros
$(".count-filters").text(cont_filters);

//Hacemos scroll hacia la tabla tras aplicar filtros
if(cont_filters > 0 && getUrlVars()["open"]==undefined) {
	$('html, body').animate({
        scrollTop: $("#wrapper-filters").offset().top
    }, 2000);
}

//Buscadores
$(".cbtn-search-home-select").on("click", function(){
    
    //var option = $(this).parent().parent().find("option:selected").val();
    var current_indicator_select = $("#sindicator").val();
	var current_year_select = $("#syear").val();

	noDataYear = 0;
	
	$.getJSON('json/years_with_data.json', function(data) {
		var yearIndicators = []
		$.each(data, function(key,value) {
			if(key === current_year_select ) {
				var yearIndicators = data[current_year_select]
				if(jQuery.inArray(current_indicator_select, yearIndicators) !== -1)noDataYear++;
			}
		});

		if(noDataYear == 0) {
			openModalAdv("The selected indicator has no data on "+current_year_select);
			//console.log("This indicator does not exist on "+current_year_select);
			return false;
		}else{
			refreshData();
			//console.log("exist");
		}
	});
    
});

//Comprobamos si el indicador existe antes de cargar el año
$(document).on("change","#sindicator",function(){
	// alert("change indicator");
	// var data = $.getJSON('json/years_with_data.json');
	// $.each(data, function(i, item) {
	//     console.log(data[i]);
	// });
	
	// var current_indicator_select = $(this).val();
	// var current_year_select = $("#syear").val();

	// noDataYear = 0;
	
	// $.getJSON('json/years_with_data.json', function(data) {
	// 	var yearIndicators = []
	// 	$.each(data, function(key,value) {
	// 		if(key === current_year_select ) {
	// 			var yearIndicators = data[current_year_select]
	// 			if(jQuery.inArray(current_indicator_select, yearIndicators) !== -1)noDataYear++;
	// 		}
	// 	});

	// 	if(noDataYear == 0) {
	// 		console.log("This indicator does not exist on "+current_year_select);
	// 		return false;
	// 	}else{
	// 		console.log("exist");
	// 	}
	// });
})


$(".leg-region").on("click", function(e){
	e.preventDefault();
	var regionFilterMap = $(this).attr("data-value"); 
	$("#sregion").val(regionFilterMap);
	$(".cbtn-search-home-select").trigger("click");
});

$(".cbtn-clear-filters").on("click", function(e){
	e.preventDefault();
	var cyear = getUrlVars()["_year"];
	var cindicator = getUrlVars()["indicator"];
	if(cyear==null)year=2015;
	if(cindicator == null)indicator="ODB";
	window.location.href = 'http://'+location.hostname+':8888/odb/?_year='+cyear+'&indicator='+cindicator;
	//window.location.href = 'http://'+location.hostname+'/data-explorer/?_year=2015&indicator=ODB'
})


$(document).delegate(".cbtn-search-modal-go","click", function(){

	var typeValue = $(this).attr("data-type");
	var valueRefresh = $(this).parent().parent().find("select").val();

	var nyear = $("#syear-modal").val();
	var nindicator = $("#sindicator-modal").val();
	
	var nopen = getUrlVars()["open"];
	var ncomparew = "";
	var nregion = "";
	var nincome = "";
	var nhdirate = "";
	var nG20 = "";
	var nG7 = "";
	var nOECD = "";
	var nIODCH = "";

	if(getUrlVars()["region"] != undefined) nregion = '&region='+getUrlVars()["region"];
	if(getUrlVars()["income"] != undefined) nincome = '&income='+getUrlVars()["income"];
	if(getUrlVars()["hdirate"] != undefined) nhdirate = '&hdirate='+getUrlVars()["hdirate"];
	if(getUrlVars()["G20"] != undefined) nG20 = '&G20='+getUrlVars()["G20"];
	if(getUrlVars()["G7"] != undefined) nG7 = '&G7='+getUrlVars()["G7"];
	if(getUrlVars()["OECD"] != undefined) nOECD = '&OECD='+getUrlVars()["OECD"];
	if(getUrlVars()["IODCH"] != undefined) nIODCH = '&IODCH='+getUrlVars()["IODCH"];
	if(getUrlVars()["comparew"] != undefined) ncomparew = '&comparew='+getUrlVars()["comparew"];
	
	//var newURLModal = 'http://'+location.hostname+'/data-explorer/?_year='+nyear+'&indicator='+nindicator+nregion+nincome+nhdirate+nG20+nG7+nOECD+nIODCH+'&open='+nopen+ncomparew;
	var newURLModal = 'http://'+location.hostname+':8888/odb/?_year='+nyear+'&indicator='+nindicator+nregion+nincome+nhdirate+nG20+nG7+nOECD+nIODCH+'&open='+nopen+ncomparew;
	noDataYear = 0;

	$.getJSON('json/years_with_data.json', function(data) {
		var yearIndicators = []
		$.each(data, function(key,value) {
			if(key === nyear ) {
				var yearIndicators = data[nyear]
				if(jQuery.inArray(nindicator, yearIndicators) !== -1)noDataYear++;
			}
		});

		if(noDataYear == 0) {
			openModalAdv("The selected indicator has no data on "+nyear);
			//console.log("This indicator does not exist on "+current_year_select);
			return false;
		}else{
			window.location.href = newURLModal;
			//console.log("exist");
		}
	});

});


$(function () {
//INICIO CARGA DE DATOS

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
                return {name:current_country.name, selected_indicator_value:area[selected_indicator].value, selected_indicator_rank:area[selected_indicator].rank, selected_indicator_range_max:selected_indicator_range_max, selected_indicator_range_min:selected_indicator_range_min, odb:area["ODB"].value, odb_rank:area["ODB"].rank, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, hdi:current_country.hdi_rank, income:current_country.income, g20:current_country.g20, g7:current_country.g7, iodch:current_country.iodch, oecd:current_country.oecd, region_iso3:current_country.area, region:_.find(window.regions, {iso3:current_country.area}).name, readiness_data:[area["GOVERNMENT_POLICIES"].value, area["GOVERNMENT_ACTION"].value, area["REGULATORY_AND_CIVIL"].value, area["BUSINESS_AND_ENTREPRENEURSHIP"].value], implementation_data:[area["INNOVATION"].value, area["SOCIAL_POLICY"].value, area["ACCOUNTABILITY"].value], impact_data:[area["POLITICAL"].value, area["SOCIAL"].value, area["ECONOMIC"].value], readiness_data_labels:[_.find(window.indicators, {indicator:"GOVERNMENT_POLICIES"}).name, _.find(window.indicators, {indicator:"GOVERNMENT_ACTION"}).name, _.find(window.indicators, {indicator:"REGULATORY_AND_CIVIL"}).name, _.find(window.indicators, {indicator:"BUSINESS_AND_ENTREPRENEURSHIP"}).name], implementation_data_labels:[_.find(window.indicators, {indicator:"INNOVATION"}).name, _.find(window.indicators, {indicator:"SOCIAL_POLICY"}).name, _.find(window.indicators, {indicator:"ACCOUNTABILITY"}).name], impact_data_labels:[_.find(window.indicators, {indicator:"POLITICAL"}).name, _.find(window.indicators, {indicator:"SOCIAL"}).name, _.find(window.indicators, {indicator:"ECONOMIC"}).name], components_data:[area["GOVERNMENT_POLICIES"].value, area["GOVERNMENT_ACTION"].value, area["REGULATORY_AND_CIVIL"].value, area["BUSINESS_AND_ENTREPRENEURSHIP"].value,area["INNOVATION"].value,area["SOCIAL_POLICY"].value,area["ACCOUNTABILITY"].value,area["POLITICAL"].value,area["SOCIAL"].value, area["ECONOMIC"].value], components_data_labels:[_.find(window.indicators, {indicator:"GOVERNMENT_POLICIES"}).name, _.find(window.indicators, {indicator:"GOVERNMENT_ACTION"}).name, _.find(window.indicators, {indicator:"REGULATORY_AND_CIVIL"}).name, _.find(window.indicators, {indicator:"BUSINESS_AND_ENTREPRENEURSHIP"}).name, _.find(window.indicators, {indicator:"INNOVATION"}).name, _.find(window.indicators, {indicator:"SOCIAL_POLICY"}).name, _.find(window.indicators, {indicator:"ACCOUNTABILITY"}).name, _.find(window.indicators, {indicator:"POLITICAL"}).name, _.find(window.indicators, {indicator:"SOCIAL"}).name, _.find(window.indicators, {indicator:"ECONOMIC"}).name]};
                /*readiness_data:{policies:area["GOVERNMENT_POLICIES"].value, action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};*/
            }
            else{
                return {name:current_country.name, selected_indicator_value:area[selected_indicator].value, selected_indicator_rank:area[selected_indicator].rank, selected_indicator_range_max:selected_indicator_range_max, selected_indicator_range_min:selected_indicator_range_min, odb:area["ODB"].value, odb_rank:area["ODB"].rank, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, hdi:current_country.hdi_rank, income:current_country.income, g20:current_country.g20, g7:current_country.g7, iodch:current_country.iodch, oecd:current_country.oecd, region_iso3:current_country.area, region:_.find(window.regions, {iso3:current_country.area}).name, readiness_data:[area["GOVERNMENT_ACTION"].value, area["REGULATORY_AND_CIVIL"].value, area["BUSINESS_AND_ENTREPRENEURSHIP"].value], implementation_data:[area["INNOVATION"].value, area["SOCIAL_POLICY"].value, area["ACCOUNTABILITY"].value], impact_data:[area["POLITICAL"].value, area["SOCIAL"].value, area["ECONOMIC"].value], readiness_data_labels:[_.find(window.indicators, {indicator:"GOVERNMENT_ACTION"}).name, _.find(window.indicators, {indicator:"REGULATORY_AND_CIVIL"}).name, _.find(window.indicators, {indicator:"BUSINESS_AND_ENTREPRENEURSHIP"}).name], implementation_data_labels:[_.find(window.indicators, {indicator:"INNOVATION"}).name, _.find(window.indicators, {indicator:"SOCIAL_POLICY"}).name, _.find(window.indicators, {indicator:"ACCOUNTABILITY"}).name], impact_data_labels:[_.find(window.indicators, {indicator:"POLITICAL"}).name, _.find(window.indicators, {indicator:"SOCIAL"}).name, _.find(window.indicators, {indicator:"ECONOMIC"}).name], components_data:[area["GOVERNMENT_ACTION"].value, area["REGULATORY_AND_CIVIL"].value, area["BUSINESS_AND_ENTREPRENEURSHIP"].value,area["INNOVATION"].value,area["SOCIAL_POLICY"].value,area["ACCOUNTABILITY"].value,area["POLITICAL"].value,area["SOCIAL"].value, area["ECONOMIC"].value], components_data_labels:[_.find(window.indicators, {indicator:"GOVERNMENT_POLICIES"}).name, _.find(window.indicators, {indicator:"GOVERNMENT_ACTION"}).name, _.find(window.indicators, {indicator:"REGULATORY_AND_CIVIL"}).name, _.find(window.indicators, {indicator:"BUSINESS_AND_ENTREPRENEURSHIP"}).name, _.find(window.indicators, {indicator:"INNOVATION"}).name, _.find(window.indicators, {indicator:"SOCIAL_POLICY"}).name, _.find(window.indicators, {indicator:"ACCOUNTABILITY"}).name, _.find(window.indicators, {indicator:"POLITICAL"}).name, _.find(window.indicators, {indicator:"SOCIAL"}).name, _.find(window.indicators, {indicator:"ECONOMIC"}).name]}; /*readiness_data:{action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};*/
            }
        }
    })
    .compact()
    .sortBy("odb")
    .reverse()
    .value();



//Custom Search para la tabla - ahora está oculta-
$('#cinput-table-search').keyup(function(){
  table.search($(this).val()).draw() ;
})


$(".cbtn-share-index").on("click",function(){

});



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


//APLICAR EL FILTRO DE DATOS
filtered_data = _.filter(columns_data, filter_applied);
filtered_table_data = _.filter(table_data, filter_applied);
drawTable(filtered_table_data);


map_data = _(data.areas)
.map(function(area, iso3){
	var current_country = _.find(window.countries, {iso3:iso3});
    if(area[selected_indicator] != null){
        return {code:iso3, value:area[selected_indicator].value, hdi:current_country.hdi_rank, income:current_country.income, g20:current_country.g20, g7:current_country.g7, iodch:current_country.iodch, oecd:current_country.oecd, region_iso3:current_country.area, region:_.find(window.regions, {iso3:current_country.area}).name};
    }
})
.compact()
.value();

map_data = _.filter(map_data, filter_applied);

number_of_countries = map_data.length - 1; //(-1 por las estadísticas)
selected_indicator_average = Math.round(data.stats[selected_indicator].mean*100)/100;


//SI RECIBIMOS PARÁMETROS DE PAÍSES CARGADOS EN LA URL ABRIMOS LA MODAL
    // if(ctrIsoCompare.length != 0) {
    //     ctrIsoCompare.forEach(function(iso3c) {
    //         $.getJSON('json/odb_' + iso3c + '.json', function(data){
    //             loaded_countries_data[iso3c] = data;
    //             loaded_countries.push(iso3c);
    //             //Este igual se puede quitar ya
    //             //ctrIsoCompare.push(iso3c);
    //             //-----
    //             carousel_current_country = 1;//loaded_countries.length-1;
    //             setCountryDataset(iso3c);
    //             //console.log(iso3c);
    //             drawModal();
    //             drawModalCountryComp(iso3c,0);
    //             //Clonamos el pais
    //             addCountrySpider();
    //             drawDatasetTable();
    //             //arrToString = ctrIsoCompare.join(",");
    //             //window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM+"&comparew="+arrToString);
    //         });
    //     });
    // }

//$("#ranking-indicator-title").text(selected_indicator_name);

//FIN CARGA DE DATOS

//GENERACIÓN DE SPARKLINES

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
            tickPositions: [0],
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

return hasRenderToArg ? new Highcharts.Chart(a, options, c) : new Highcharts.Chart(options, b);
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
    subindex_colors = ["#FFCD00", "#6DF5D7", "#BE8FE7"],
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
                categories: labels,//countries,
                lineColor:colums_color
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
//FIN GENERACIÓN DE SPARKLINES

//CASO 0: Aquí solo abrian las countries filtradas
function openModalMap() {
	//alert(this.code);
	$("#table-data tbody a[data-iso='"+this.code+"']").trigger("click");
}

//CASO 1: Función para mostrar el modal de countries con independencia de la información filtrada
function showCountryData (data) {
	var country = this.code;
	loaded_countries.push(country);
	if(getUrlVars()["open"]===undefined) {
		base_URL_OM = base_URL+"&open="+country;
		window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM);
	}else{
		base_URL_OM = base_URL+"&open="+country;
	}
    //cargo el json del primer país
    $.getJSON('json/odb_' + country + '.json', function(data){
        loaded_countries_data[country] = data;
        setCountryDataset(country);
        //Solo necesitamos unos milisegundos
       	drawModal();
       	showModal();
    });
}

function openModalBars() {
	//alert("click: "+this.iso3);
	$("#table-data tbody a[data-iso='"+this.iso3+"']").trigger("click");
}

// GENERACIÓN DEL MAPA

$('#wrapper-map').highcharts('Map', {
	//series: [{
	//	mapData: window.worldMap
	//}],
	credits: {
	    enabled:false
	},
	chart: {
	    backgroundColor: 'transparent',
	    margin: 0,
	    resetZoomButton: {
	    	//No esta funcionando...
	    	position: {
                // align: 'right', // by default
                // verticalAlign: 'top', // by default
                x: -50,
                y: -50
            },
            relativeTo: "chart",
            theme: {
                fill: 'black',
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
	    text: ''
	},
	tooltip: {
	      //enabled:false,
	      //name: 'Densidad de población',
	},
	legend: {
	    title: {
	        text: selected_indicator_name+" ("+year+")",
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
	    enableDoubleClickZoom: false,
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
                click: showCountryData
            }
        }
    }]
});

// FIN GENERACIÓN MAPA

// GENERACIÓN GRÁFICO DE BARRAS

 $('#column-graph').highcharts({
    credits: {
        enabled:false
    },
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
        text: selected_indicator_name+" ("+year+")"
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
        pointFormat: selected_indicator_name + ': <b>{point.y:.2f}</b>'
    },
    series: [{
        name: selected_indicator_name,
        data: filtered_data, //columns_data,
        dataLabels: {
            enabled: true,
            rotation: -75,
            color: '#333333',
            align: 'left',
            format: '{point.y:.2f}', // one decimal
            y: -1, // 10 pixels down from the top
            style: {
                fontSize: '8px',
                fontFamily: 'Arial, sans-serif'
            }
        },
        point: {
            events: {
                click: openModalBars
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
});//FIN CARGA DE DATOS



	// function processAjaxData(response, urlPath){
	//      document.getElementById("content").innerHTML = response.html;
	//      document.title = response.pageTitle;
	//      window.history.pushState({"html":response.html,"pageTitle":response.pageTitle},"", urlPath);
	//  }

	// No hace falta ya que al seleccionarlo se abre el pais
	// $(".cbtn-search-home-input").on("click", function(){
	// 	var isoCountry = $(this).attr("data-id");
	// 	$("#table-data tbody a[data-iso='"+isoCountry+"']").trigger("click");
	// });


	$(document).delegate(".more-info","click", function(e){

		e.preventDefault();

		var country = $(this).attr("data-iso");
		loaded_countries.push(country);

		if(getUrlVars()["open"]===undefined) {
			base_URL_OM = base_URL+"&open="+country;
			window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM);
		}else{
			base_URL_OM = base_URL+"&open="+country;
		}

		// base_URL_OM = base_URL_OM+country;
		// if(getUrlVars()["open"]==undefined) {
		// 	window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM);
		// }
        //console.log(country);
        //cargo el json del primer país
        $.getJSON('json/odb_' + country + '.json', function(data){
            loaded_countries_data[country] = data;
            setCountryDataset(country);
            //Solo necesitamos unos milisegundos
           	drawModal();
        });

	});


	var options = {
        url: 'json/countries.json',
        theme: "none",
        //getValue: "search",
        getValue: function(element) {
            return element.search;
            //console.log("Element: "+element.search);
        },
        template: {
            type: "custom",
            method: function(value,item) {
                return "<div class='country-select-autoc' data-item-id='"+item.iso3+"'><span class='adj-img-flag-ac flag-md flag-country'><img class='adj-img-ca-h img-responsive' src='img/flags/"+item.iso2.toLowerCase()+".svg'></span> <span class='hddn'>"+value+"</span> <span class='adj-txt-country-autoc'>" + item.name + "</span></div>";
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
                var yearNow = $("#syear").val();
                var dataExist = _.includes(_.find(countries,{iso3:selectedItemId}).years_with_data,parseInt(selected_year));
               	if(dataExist){
               		$("#cinput-s-country").val("");
               		OpenCountryData(selectedItemId);
               	}else{
               		openModalAdv("No data country available on "+yearNow);
               	}
                //$("#table-data tbody a[data-iso='"+selectedItemId+"']").trigger("click");
                //$(".cbtn-search-home-input").attr("data-id",selectedItemId);
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
        	if(element.search == null) {
        		return false;
        	}else{
            	return element.search;
            }
            //console.log("Element: "+element.search);
        },
        template: {
            type: "custom",
            method: function(value,item) {
                return "<div class='country-select-autoc' data-item-id='"+item.iso3+"'><span class='adj-img-flag-ac flag-md flag-country'><img class='adj-img-ca-h img-responsive' src='img/flags/"+item.iso2.toLowerCase()+".svg'></span> <span class='hddn'>"+value+"</span> <span class='adj-txt-country-autoc'>" + item.name + "</span></div>";
            }
        },
        list: {
            match: {
                enabled: true
            },
            maxNumberOfElements: 15,
            onChooseEvent: function() {
                //var value = $("#cinput-s-country").getSelectedItemData().country;
                var selectedItemModalId = $(".cmodal .easy-autocomplete").find("ul li.selected div.country-select-autoc").attr("data-item-id");
                $(".cbtn-md-add-country").attr("data-id",selectedItemModalId);
                var dataExist = _.includes(_.find(countries,{iso3:selectedItemModalId}).years_with_data,parseInt(selected_year));
               	if(dataExist){
               		$(".cbtn-md-add-country").click();
               		$("#cinput-s-country-modal").val("");
               	}else{
               		openModalAdv("No data country available on "+selected_year);
               	}
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


    //Aperturas y cierres de los tabs de los indicadores en los modales
    $(".gci-mnu-item").on("click", function(){
    	var idAcc = $(this).attr("data-id");
    	$("ul.gci-mnu").find("li.gci-mnu-item-ac").removeClass("gci-mnu-item-ac");
    	$(this).addClass("gci-mnu-item-ac");
    	$("div.gci-content").removeClass("cgi-c-open");
    	$("div[data-mdin='"+idAcc+"']").addClass("cgi-c-open");
    })


    //Iniciamos el dropdown con checbox...
    $("#sgroup").multiselect({
	    placeholder: 'Choose...'
	});


    //##OWLCAROUSEL CONFIG
	owl.owlCarousel();
	var rmItemOwl = 0; //remove item owl carousel

	owl.on('refreshed.owl.carousel', function(event) {
		rmItemCount = event.item.count;
		if(rmItemCount == 0) {
			owl.trigger('add.owl.carousel', '<div class="country-area-empty r-pos"><div class="no-country-select txt-c"><img src="img/img-world-compare-with.png" class="c-obj"><p class="c-g40 p-s-top txt-l">Select a country ...</p></div></div>',0);
			owl.trigger('refresh.owl.carousel');
			$("table#cm-table-readliness tbody tr:last").html("");
			$("table#cm-table-impact tbody tr:last").html("");
		}
        /*if(loaded_countries.length=2){
            addCountrySpider();
            console.log("llamo al spider desde el refreshed.owlcarousel");
        }*/
        if(loaded_countries.length!=0){drawDatasetTable();}
		//console.log("quedan: "+rmItemCount + " actual=" + carousel_current_country);
	});

	owl.on('changed.owl.carousel', function(event) {
		//rmItemOwl = event.item.index;
		rmItemCount = event.page.count;
        /*if(loaded_countries.length>1){
            addCountrySpider(loaded_countries[carousel_current_country+1]);
            console.log("llamo al spider desde el changed.owlcarousel");
        }*/
        drawDatasetTable();
		//console.log("Nos movemos a "+rmItemOwl);
	});

	owl.on('translated.owl.carousel', function(event) {
		carousel_current_country = event.item.index + 1;
        //console.log("Desde el translated.owlcarousel. Carouselcurrentcountry = " + carousel_current_country);
		if(loaded_countries.length>1){      
	        addCountrySpider();
	        drawDatasetTable();
	        drawIndicatorsTableModal();
        }
		//console.log("Estamos en:" + carousel_current_country);
	});




	//añadir un país al carousel
	$(".cbtn-md-add-country").on("click", function(e) {

		//Comprobamos que se haya seleccionado al menos un pais y que no esté ya en el carousel
		var cont = 0;
		var msg = 0;
		var idAddCtr = $(this).attr("data-id");

        if(loaded_countries.contains(idAddCtr)) {
        	openModalAdv("This country has already been selected here");
			//alert("This country has already been selected here");
			return false;
		}

		if($("#cinput-s-country-modal").val() =="" || $(this).attr("data-id")=="") {
			msg = 1;
			alert("Please select a country");
			return false;
		}

		$("div.owl-stage div.country-item").each(function() {
			if ($(this).attr("data-id")==idAddCtr) {
				msg = 2;
				cont ++;
			}
		})

		if(cont !=0) {
			//alert("This country has already been selected");
			openModalAdv("This country has already been selected");
			return false;
		}

		e.preventDefault();
		//console.log("URL current: "+base_URL);
		//console.log("URL OM: "+base_URL_OM);
		

        $.getJSON('json/odb_' + idAddCtr + '.json', function(data){
            loaded_countries.push(idAddCtr);
            loaded_countries_data[idAddCtr] = data;
            carousel_current_country = loaded_countries.length-1;
            //console.log(carousel_current_country);
            //console.log(loaded_countries_data);
            setCountryDataset(idAddCtr);
            //Clonamos el pais
            addCountrySpider();
            drawDatasetTable();
            drawModalCountryComp(idAddCtr,1);
            drawIndicatorsTableModal();	
            //Inyectamos los datos en la araña
            //addCountrySpider (idAddCtr);

            //Agregamos a la URL los componentes
            ctrIsoCompare.push(idAddCtr);
            arrToString = ctrIsoCompare.join(",");
            window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM+"&comparew="+arrToString);
        });
		var ncountry = $(".owl-stage").find(".country-area-empty").length;

		if(ncountry == 1) {
			owl.trigger('remove.owl.carousel', 0);
		}

        //Limpiamos el formulario
            $(this).attr("data-id","");
            $("#cinput-s-country-modal").val("");
		// if (raw_URL.indexOf("&comparew=") === -1) {
		//
		// }

           // drawDatasetTable();
	})

	//Borrado de countries en el carousel
	$(".cmodal-d-global").delegate(".md-h-removec","click", function(e){
		e.preventDefault();
	   	//HAY QUE BORRAR EL CÓDIGO iso3 de loaded_countries----------------
	   	//Borramos el item del carousel, antes averiguamos cual es:
	   	var rmItemOwl = $(".owl-stage").find("div.country-item[data-id='"+$(this).attr("data-id")+"']").parent().index();
	   	//console.log("Borramos el item: "+rmItemOwl);

        var currentCountryIso3 = loaded_countries[carousel_current_country];
        //console.log("borrando " + currentCountryIso3)
        //console.log("carousel_current_country: " + carousel_current_country);
        //console.log("loaded_countries_length: " + loaded_countries.length);
        //console.log(loaded_countries);
        if((carousel_current_country + 1) == loaded_countries.length){
            loaded_countries.remove(currentCountryIso3);
            carousel_current_country--;//$(".owl-stage").find("div.owl-item.active").index();
            // console.log("ME QUIERO MOVER A LA POSICIÓN: " + (carousel_current_country));
            owl.trigger('remove.owl.carousel', rmItemOwl);
            owl.trigger('to.owl.carousel', carousel_current_country, 100);
            owl.trigger('refresh.owl.carousel');
        }
        else{
            loaded_countries.remove(currentCountryIso3);
            owl.trigger('remove.owl.carousel', rmItemOwl);
            owl.trigger('refresh.owl.carousel');
        }
        currentCountryIso3 = loaded_countries[carousel_current_country];
        //console.log("cargando " + currentCountryIso3)
        addCountrySpider();
        drawDatasetTable();
        drawIndicatorsTableModal();	

		var ctrURL = getUrlVars()["comparew"];
		var stringToArray = ctrURL.split(",");

		removeItem = $(this).attr("data-id");
		stringToArray = jQuery.grep(stringToArray, function(value) {
			return value != removeItem;
		});
        //Refrescamos el array existente donde se añaden
        ctrIsoCompare = stringToArray;

		arrToString = stringToArray.join(",");

		//console.log("long array: "+stringToArray.length);

		if(stringToArray.length !== 0) {
			window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM+"&comparew="+arrToString);
		}else{
			window.history.pushState("", "ODB, Open Data Barometer",base_URL_OM);
			ctrIsoCompare = [];
		}

		// ctrIsoCompareRw = jQuery.grep(ctrIsoCompareRw, function(value) {
		//   return value != removeItem;
		// });
	})






	//Prueba de iconos de ayuda en cabecera de tabla
	// $(".cicon-help").on("click", function(e){
	// 	e.stopPropagation();
	// 	alert("help!");
	// })

	//Apertura / cierre del modal detalle de countries
	$(document).delegate(".more-info, .close-cmodal-detail","click", function(e){

	   e.preventDefault();

	   if(!$(".cmodal-detail").is(".cmodal-detail-open")) {
			$(".cmodal-detail").addClass("cmodal-detail-open");
			$(".overlay").addClass("overlay-open");
			$("body").addClass("noscroll");
	   }else{
			$(".cmodal-detail").removeClass("cmodal-detail-open");
			$(".overlay").removeClass("overlay-open");
			$("body").removeClass("noscroll");
			
			$("#cinput-s-country-modal").val("");
			$("#cinput-s-country").val("");
			window.history.pushState("", "ODB, Open Data Barometer",base_URL);

		    //Reiniciamos la variables:
		    ctrIsoCompare = [];
		    base_URL_OM = window.location.href+'&open=';
		   	loaded_countries = [];

		    //Vaciamos el carousel
		    owl.trigger('replace.owl.carousel', '<div class="country-area-empty r-pos"><div class="no-country-select txt-c"><img src="img/img-world-compare-with.png" class="c-obj"><p class="c-g40 p-s-top txt-l">Select a country ...</p></div></div>',0);
			owl.trigger('refresh.owl.carousel');
			$("table#cm-table-readliness tbody tr:last").html("");
			$("table#cm-table-impact tbody tr:last").html("");

	   }

	})


	//Apertura / cierre del modal de sharing is caring
	$(document).delegate(".cbtn-share, .close-cmodal-share","click", function(e){

		//url_fake_facebook = encodeURIComponent("http://www.lugaresdeasturias.com/odb2/?_year=2015&indicator=ODB")
		url_share = window.location.href;
		url_share_coded = encodeURIComponent(url_share);

		// url_share = window.location.href;	
		// if(getUrlVars()["comparew"]!=undefined){
		// 	var url_codify = url_share.substring(0, url_share.lastIndexOf("&comparew="));
		// 	var compare = getUrlVars()["comparew"];
		// 	//var compare_end = compare.replace(/,/g,"%252C"); 
		// 	url_share_coded = encodeURIComponent(url_codify+'&comparew=');
		// }else{
		// 	url_share_coded = encodeURIComponent(url_share)
		// }

		urlfacebook = 'http://www.facebook.com/sharer.php?u='+url_share_coded
		urltwitter = 'https://twitter.com/share?url='+url_share_coded+'&hashtags=ODBarometer';
		urlgoogleplus = 'https://plus.google.com/share?url='+url_share_coded;
		urlLinkedin = 'http://www.linkedin.com/cws/share?url='+url_share_coded;;

		$(".sh-a-facebook").attr("href",urlfacebook);
		$(".sh-a-twitter").attr("href",urltwitter);
		$(".sh-a-googleplus").attr("href",urlgoogleplus);
		$(".sh-a-linkedin").attr("href",urlLinkedin);	

		$("meta[property='og\\:url']").attr("content", url_share_coded);

	   	e.preventDefault();

	   if(!$(".cmodal-a-share").is(".cmodal-a-share-open")) {
	   		
	   		$(".cmodal-a-share").addClass("cmodal-a-share-open");
	   		if($(".cmodal-detail").is(".cmodal-detail-open")) {
	   			$(".cmodal-detail").css({"opacity":0.4});
	   		}else{
	   			$(".overlay").addClass("overlay-open");
				$("body").addClass("noscroll");
	   		}

	   }else{

			$(".cmodal-a-share").removeClass("cmodal-a-share-open");
			if($(".cmodal-detail").is(".cmodal-detail-open")) {
	   			$(".cmodal-detail").css({"opacity":1});
	   		}else{
	   			$(".overlay").removeClass("overlay-open");
	   			$("body").removeClass("noscroll");
	   		}

			//window.history.pushState("", "ODB, Open Data Barometer",base_URL);

	   }

	})

	$(document).delegate(".cbtn-close-adv","click", function(e){
		$(".cmodal-handsup").removeClass("cmodal-handsup-open");
		$(".cmodal-detail").css("opacity",1);
		if(!$(".cmodal-detail").is(".cmodal-detail-open")) {
			$("body").removeClass("noscroll");
			$(".overlay").removeClass("overlay-open");
		}
	});


	//Cierre presionando esc del modal detalle de countries
	$(document).keyup(function(e) {

		//if (e.keyCode == 13) $('.save').click();     // enter
		if (e.keyCode == 27) {

			if($(".cmodal-a-share").is(".cmodal-a-share-open") && !$(".cmodal-detail").is(".cmodal-detail-open")) {
				$(".cmodal-a-share").removeClass("cmodal-a-share-open");
				$(".overlay").removeClass("overlay-open");
				$("body").removeClass("noscroll");
			}

			//Escape solo para cerrar la ventana de detalle de usuario
			if($(".cmodal-detail").is(".cmodal-detail-open")) {

				$(".cmodal-detail").css({"opacity":1});

				if($(".cmodal-handsup").is(".cmodal-handsup-open")){
					$(".cmodal-handsup").removeClass("cmodal-handsup-open");
					return false;
				}

				if($(".cmodal-a-share").is(".cmodal-a-share-open")) {
					$(".cmodal-a-share").removeClass("cmodal-a-share-open");
					return false;
				}

				$("#cinput-s-country-modal").val("");
				$("#cinput-s-country").val("");

				window.history.pushState("", "ODB, Open Data Barometer",base_URL);
				//Reiniciamos la variables:
			    ctrIsoCompare = [];
			    base_URL_OM = window.location.href+'&open=';
                loaded_countries = [];

			    //Vaciamos el carousel
		    	owl.trigger('replace.owl.carousel', '<div class="country-area-empty r-pos"><div class="no-country-select txt-c"><img src="img/img-world-compare-with.png" class="c-obj"><p class="c-g40 p-s-top txt-l">Select a country ...</p></div></div>',0);
				owl.trigger('refresh.owl.carousel');
				$("table#cm-table-impact tbody tr:last").html("");
				$("table#cm-table-readliness tbody tr:last").html("");

				$(".cmodal-detail").removeClass("cmodal-detail-open");
				$(".overlay").removeClass("overlay-open");
				$("body").removeClass("noscroll");
				
			}

		}
	});


	//Apertura / cierre del colapsable de implementation
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



	//Preproceso para el json de barras y paises
	var processed_json = new Array();

	$(".modal-data").on("click", function(){
		$(this).removeClass("modal-data-visible");
	});

	function drawTable(data){
		//seleccionar #table-data -> tbody
		//For each object in data
		var current_row = "";
		var my_table = $("#table-data");

		var rank_change;
		if(selected_indicator == "ODB"){
			current_row = '<table class="ctable ctable-light w100">' +
							'<thead class="th-main">' +
							'<tr>' +
							'<th class="ct-th txt-al p-left-l">Country <span class="ct-th-st"></span></th>' +
							'<th class="ct-th txt-al">ODB <span class="cover-help"><span class="cicon-help click txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="--"></span></span> <span class="ct-th-st txt-xs uppc">Rank</span> </th>' +
							'<th class="ct-th txt-al">ODB <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="An assessment of the true prevalence of open data initiatives around the world."></span></span> <span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">Readiness <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="The readiness of states, citizens and entrepreneurs to secure the benefits of open data."></span></span><span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">Implementation <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="The extent to which accessible, timely, and open data is published by each country government on a selection of 15 key fields."></span></span><span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">Emerging Impact <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="The extend to which there is any evidence that open data release by the country government has had positive impacts in a variety of different domains in the country."></span></span><span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">ODB <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="--"></span></span><span class="ct-th-st uppc txt-xs">change</span></th>' +
							'</tr>' +
							'</thead>' +
							'<tbody>';

			for(i=0; i<data.length; i++){

				//if(data[i].odb_rank_change!=null){}else{rank_change = 0}
				rank_change = data[i].odb_rank_change;
				//console.log("Rank change: "+data[i].odb_rank_change);

				if (rank_change == null) {
					rank_print = '<span class="txt-xxs cprimary uppc">New</span>';
				}else{
					if(rank_change<0){
						var rank_print = '<span class="arrow-down"></span> '+ Math.abs(rank_change);
					} else {
						var rank_print = '<span class="arrow-up"></span> ' + rank_change;
						if(rank_change == 0) {
							rank_print = '<span class="txt-xs c-g40">0</span>';
						}
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

				var flagtlwc = data[i].iso2;
				current_row = current_row + '<tr>' +
				'<td class="ct-td txt-al p-left-l">' +
						'<span class="flag"><img src="img/flags/' + flagtlwc.toLowerCase() + '.svg" class="img-responsive"></span>' +
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
			current_row = current_row + '</tbody></table>';

			//(current_row);
			//$("#table-data body").html(current_row);
			my_table.append(current_row);
			//Iniciamos la tabla ordenada por ODB Rank y ODB asc
			var table = $('#table-data table').DataTable({
				fixedHeader: true,
				paging: false,
				order: [[1,"asc"], [2,"desc"]],
				//info: false,
				sDom: 't', //Que solo renderice la tabla
				language: {
					"sEmptyTable": "No countries meet the criteria"
					//search: "_INPUT_",
					//searchPlaceholder: "Search country ..."
				}
			});
		}
		else{
			current_row = '<table class="ctable ctable-light w100">' +
							'<thead class="th-main">' +
							'<tr>' +
							'<th class="ct-th txt-al p-left-l">Country <span class="ct-th-st"></span></th>' +
							'<th class="ct-th txt-al">Indicator <span class="cover-help"><span class="cicon-help click txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="' + selected_indicator_name + '"></span></span> <span class="ct-th-st txt-xs uppc">' + 'out of ' + selected_indicator_range_max + '</span> </th>' +
							'<th class="ct-th txt-al">ODB <span class="cover-help"><span class="cicon-help click txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="--"></span></span> <span class="ct-th-st txt-xs uppc">Rank</span> </th>' +
							'<th class="ct-th txt-al">ODB <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="An assessment of the true prevalence of open data initiatives around the world."></span></span> <span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">Readiness <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="The readiness of states, citizens and entrepreneurs to secure the benefits of open data."></span></span><span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">Implementation <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="The extent to which accessible, timely, and open data is published by each country government on a selection of 15 key fields."></span></span><span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'<th class="ct-th txt-al">Emerging Impact <span class="cover-help"><span class="cicon-help txt-l" data-placement="bottom" data-toggle="tooltip" data-original-title="The extend to which there is any evidence that open data release by the country government has had positive impacts in a variety of different domains in the country."></span></span><span class="ct-th-st txt-xs uppc">Out of 100</span></th>' +
							'</tr>' +
							'</thead>' +
							'<tbody>';

			for(i=0; i<data.length; i++){

				//if(data[i].odb_rank_change!=null){}else{rank_change = 0}
				rank_change = data[i].odb_rank_change;
				//console.log("Rank change: "+data[i].odb_rank_change);

				if (rank_change == null) {
					rank_print = '<span class="txt-xxs cprimary uppc">New</span>';
				}else{
					if(rank_change<0){
						var rank_print = '<span class="arrow-down"></span> '+ Math.abs(rank_change);
					} else {
						var rank_print = '<span class="arrow-up"></span> ' + rank_change;
						if(rank_change == 0) {
							rank_print = '<span class="txt-xs c-g40">0</span>';
						}
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

				var flagtlwc = data[i].iso2;
				current_row = current_row + '<tr>' +
				'<td class="ct-td txt-al p-left-l">' +
						'<span class="flag"><img src="img/flags/' + flagtlwc.toLowerCase() + '.svg" class="img-responsive"></span>' +
						'<span class="ct-country"><span class="">' + data[i].name + '</span> <a href="#" class="txt-s more-info displayb" data-iso="' + data[i].iso3 + '"> See details</a></span>' +
				   '</td>' +
				   '<td class="ct-td txt-c txt-med">' + data[i].selected_indicator_value + '</td>' +
				   '<td class="ct-td txt-c txt-med">' + data[i].odb_rank + '</td>' +
				   '<td class="ct-td txt-c txt-med">' + odbPrint +'</span></td>' +
				   '<td class="ct-td txt-c"><span class="displayib" data-labels="' + data[i].readiness_data_labels + '" data-subindex="readiness" data-sparkline="' + data[i].readiness_data + ' ; column"></span><span class="data-sp data-readiness displayib txt-xl m-left">' + data[i].readiness + '</span></td>' +
				   '<td class="ct-td txt-c"><span class="displayib" data-labels="' + data[i].implementation_data_labels + '" data-subindex = "implementation" data-sparkline="' + data[i].implementation_data + ' ; column"></span><span class="data-sp data-implementation displayib txt-xl m-left">' + data[i].implementation + '</span></td>' +
				   '<td class="ct-td txt-c"><span class="displayib" data-labels="' + data[i].impact_data_labels + '" data-subindex="impact" data-sparkline="' + data[i].impact_data + ' ; column"></span><span class="data-sp data-impact displayib txt-xl m-left">' + data[i].impact + '</span></td>' +
				'</tr>';
			}
			current_row = current_row + '</tbody></table>';
			//(current_row);
			//$("#table-data body").html(current_row);
			my_table.append(current_row);
			//Iniciamos la tabla ordenada por ODB Rank y ODB asc
			var table = $('#table-data table').DataTable({
				fixedHeader: true,
				paging: false,
				order: [[1,"desc"], [2,"asc"]],
				//info: false,
				sDom: 't', //Que solo renderice la tabla
				language: {
					"sEmptyTable": "No countries meet the criteria"
					//search: "_INPUT_",
					//searchPlaceholder: "Search country ..."
				}
			});
		}
		
		$(function () {
			$('[data-toggle="tooltip"]').tooltip();
		});

		var openModal = getUrlVars()["open"];
		if(openModal!=undefined) {
			//$("#table-data tbody a[data-iso='"+openModal+"']").trigger("click");
			OpenCountryData (openModal);
		}

		$(function () {
			$('[data-toggle="tooltip"]').tooltip();
		});
	}
});
