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
  var rmItemCount = 0;
function dosomething(event) {
	rmItemCount = event.item.count;
	console.log("quedan: "+rmItemCount);
}

	$(".cbtn-md-add-country").on("click", function(e) {

		e.preventDefault();
		console.log("Posicion: "+rmItemCount);

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

		console.log("quedan: "+rmItemCount);
	});

	owl.on('changed.owl.carousel', function(event) {
		rmItemOwl = event.item.index;
		rmItemCount = event.page.count;
		console.log("Borramos el item: "+rmItemOwl+", ahora quedan: "+rmItemCount);
	});


	$(".cmodal-d-global").delegate(".md-h-removec","click", function(e){
	//$(".md-h-removec").on("click", function(e) {
		e.preventDefault();
	   //console.log("Borramos el item: "+rmItemOwl+", ahora quedan: "+rmItemCount);
		owl.trigger('remove.owl.carousel', rmItemOwl);
		owl.trigger('refresh.owl.carousel');

	})

	$(function () {
		$('[data-toggle="tooltip"]').tooltip();
	})

	$(".cicon-help").on("click", function(e){
		e.stopPropagation();
		alert("help!");
	})

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
		for(i=0; i<data.length; i++){
		current_row = current_row + '<tr>' +	
			'<td class="ct-td txt-al p-left-l">' +
					'<span class="flag"><img src="img/flags/' + data[i].iso2 + '.svg" class="img-responsive"></span>' +
					'<span class="ct-country"><span class="txt-l">' + data[i].name + '</span> <a href="#" class="txt-s more-info displayb"> See details</a></span>' +
			   '</td>' +
			   '<td class="ct-td txt-c txt-med">' + data[i].odb_rank + '</td>' +
			   '<td class="ct-td txt-c txt-med">' + data[i].odb+ '</td>' +
			   '<td class="ct-td txt-al" data-sparkline="-6, 25, 5, 32 ; column">' + data[i].readiness + '</td>' +
			   '<td class="ct-td txt-al">' + data[i].implementation + '</td>' +
			   '<td class="ct-td txt-al">' + data[i].impact + '</td>' +
			   '<td class="ct-td txt-c txt-med"><span class="arrow-up">A</span> ' + data[i].odb_rank_change + '</td>' +
			'</tr>';
		}
		console.log(current_row);
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
						return {name:current_country.name, selected_indicator_value:area[selected_indicator].value, selected_indicator_rank:area[selected_indicator].rank, odb:area["ODB"].value, odb_rank:area["ODB"].rank, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, readiness_data:{policies:area["GOVERNMENT_POLICIES"].value, action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};
					}
					else{
						return {name:current_country.name, selected_indicator_value:area[selected_indicator].value, selected_indicator_rank:area[selected_indicator].rank, odb:area["ODB"].value, odb_rank:area["ODB"].rank, odb_rank_change:area["ODB"].rank_change, readiness:area["READINESS"].value, implementation:area["IMPLEMENTATION"].value, impact:area["IMPACT"].value, iso2:current_country.iso2, iso3:current_country.iso3, readiness_data:{action:area["GOVERNMENT_ACTION"].value, civil:area["REGULATORY_AND_CIVIL"].value, business:area["BUSINESS_AND_ENTREPRENEURSHIP"].value}, implementation_data:{innovation:area["INNOVATION"].value, social:area["SOCIAL_POLICY"].value, accountability:area["ACCOUNTABILITY"].value}, impact_data:{political:area["POLITICAL"].value, social:area["SOCIAL"].value, economic:area["ECONOMIC"].value}};
					}
				}
			})
			.compact()
			.sortBy("odb")
			.reverse()
			.value();
			drawTable(table_data);
			//Iniciamos la tabla
			var table = $('#table-data').DataTable({
				fixedHeader: true,
				paging: false,
				//info: false,
				sDom: 't' //Que solo renderice la tabla
				// language: {
				//     search: "_INPUT_",
				//     searchPlaceholder: "Search country ..."
				// }
			});

	//Custom Search
	$('#cinput-table-search').keyup(function(){
		  console.log($(this).val());
		  table.search($(this).val()).draw() ;
	})
	
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
                    type: 'area',
                    margin: [2, 0, 2, 0],
                    width: 120,
                    height: 20,
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
                        negativeColor: '#910000',
                        borderColor: 'silver'
                    }
                }
            };

        options = Highcharts.merge(defaultOptions, options);

        return hasRenderToArg ?
            new Highcharts.Chart(a, options, c) :
            new Highcharts.Chart(options, b);
    };

    var start = +new Date(),
        $tds = $('td[data-sparkline]'),
        fullLen = $tds.length,
        n = 0;

    // Creating 153 sparkline charts is quite fast in modern browsers, but IE8 and mobile
    // can take some seconds, so we split the input into chunks and apply them in timeouts
    // in order avoid locking up the browser process and allow interaction.
    function doChunk() {
        var time = +new Date(),
            i,
            len = $tds.length,
            $td,
            stringdata,
            arr,
            data,
            chart;

        for (i = 0; i < len; i += 1) {
            $td = $($tds[i]);
            stringdata = $td.data('sparkline');
            arr = stringdata.split('; ');
            data = $.map(arr[0].split(', '), parseFloat);
            chart = {};

            if (arr[1]) {
                chart.type = arr[1];
            }
            $td.highcharts('SparkLine', {
                series: [{
                    data: data,
                    pointStart: 1
                }],
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">' + $td.parent().find('th').html() + ', Q{point.x}:</span><br/>',
                    pointFormat: '<b>{point.y}.000</b> USD'
                },
                chart: chart
            });

            n += 1;

            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 500) {
                $tds.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }

            // Print a feedback on the performance
            if (n === fullLen) {
                $('#result').html('Generated ' + fullLen + ' sparklines in ' + (new Date() - start) + ' ms');
            }
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