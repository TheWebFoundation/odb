//VARIABLES PARA LOS FILTROS
var selected_year = 2013;
var selected_indicator = "ODB";
var selected_indicator_name = _.find(window.indicators, {indicator:selected_indicator}).name;
var selected_indicator_source = _.find(window.indicators, {indicator:selected_indicator}).source_name;
var selected_indicator_source_url = _.find(window.indicators, {indicator:selected_indicator}).source_url;
var selected_indicator_average;
var selected_indicator_range = _.find(window.indicators, {indicator:selected_indicator}).range;
var selected_indicator_range_min = selected_indicator_range.substr(0, selected_indicator_range.indexOf("-"));
var selected_indicator_range_max = selected_indicator_range.substr(selected_indicator_range.indexOf("-")+1, selected_indicator_range.length);
var number_of_countries;
var series = [];

var filter_data;

//variables de preproceso para el json de barras y paises
var columns_data;
var table_data;
var map_data;

$(document).ready(function() {
	
	$(".cicon-help").on("click", function(e){
		e.stopPropagation();
		alert("help!");
	})

	$(".more-info, .close-cmodal-detail").on("click", function(e){

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

	//Iniciamos la tabla
	var table = $('#table-data').DataTable({
		fixedHeader: true,
		paging: false,
		info: false
	});

	$(".modal-data").on("click", function(){
		$(this).removeClass("modal-data-visible");
	});

	$(function () {
		//INICIO CARGA DE DATOS
		//[{y:107, color:'#FF00FF'}, {y:80, color:'#FF0000'}, {y:20, color:'#00FFFF'}]
		$.getJSON('json/odb_' + selected_year + '.json', function (data) {
			columns_data = _(data.areas)
			.map(function(area, iso3){
				var current_country = _.find(window.countries, {iso3:iso3});
				if(area[selected_indicator] != null){
					return {name:current_country.name, y:area[selected_indicator].value, color:window.regions_colors[_.find(window.regions, {iso3:current_country.area}).name], region:_.find(window.regions, {iso3:current_country.area}).name, income:current_country.income, hdi:current_country.hdi_rank, iodch:current_country.iodch, oecd:current_country.oecd, g20:current_country.g20, g7:current_country.g7, iso3:current_country.iso3};
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
						return {name:current_country.name, odb:area["ODB"].value, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, readiness_data:{policies:area["GOVERNMENT_POLICIES"].value, action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};
					}
					else{
						return {name:current_country.name, odb:area["ODB"].value, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, readiness_data:{action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};
					}
				}
			})
			.compact()
			.sortBy("odb")
			.reverse()
			.value();
			
			
			filter_data = columns_data;//_.filter(columns_data, {region:'East Asia & Pacific'});

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

				$div = $(".grafica");

				window.chart = new Highcharts.Chart({

					chart: {
						renderTo: $div[0],
						type: 'column',
						width: 280,
						height: 240,
						backgroundColor: null,
						borderWidth: 0,
						type: 'column',
						//margin: [2, 0, 2, 0],
						width: 290,
						height: 120,
						style: {
							overflow: 'visible'
						}
					},
					title: {
						text: null
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
					series: [{
						name: 'Population',
						data: [{
							name: 'Min population knowing',
							color: '#79B042',
							y: 3
						}, {
							name: 'Population of '+this.name,
							color: '#FFE064',
							y: this.value
						}],
						dataLabels: {
							format: '<b>{point.name}</b> {point.percentage:.1f}% out of 100%'
						},
						column: {
							borderColor: 'silver'
						}
					}]

				});

			}

			// Propiedades gráfico del mapa
			$('#wrapper-map').highcharts('Map', {

				chart: {
					backgroundColor: 'transparent'
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
						verticalAlign: 'bottom'
					},
					enableMouseWheelZoom: false
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
							click: pointClick
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
					renderTo: 'column-graph'
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
					max: filter_data.length - 1//number_of_countries
				},
				scrollbar: {
					enabled: true
				},
				yAxis: {
					min: selected_indicator_range_min,
					max: selected_indicator_range_max,
					//categories: ['data.value'],
					title: {
						text: null
					},
					plotLines: [{
						color: '#79b042',
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
					data: filter_data, //columns_data,
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
