function generateringComponent(vardata, vargeodata){
  var lookup = genLookup(vargeodata) ;
  var impactMap = dc.leafletChoroplethChart('#Map');
  var dataTab1 = dc.dataTable('#dataTable1');
  var ind = dc.pieChart('#indicator');
  var fd = dc.pieChart('#Field');
  var mes = dc.rowChart('#Measure');
  var whoChart = dc.rowChart('#who');
  var whatChart = dc.rowChart('#what');
  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();
  var mapDimension = cf.dimension(function(d) { return d.country_code});
  var mapGroup = mapDimension.group();
  var indDimension = cf.dimension(function(d) {return d['Type_indicator']});
  var indGroup = indDimension.group();
  var fdDim = cf.dimension(function(d) {return d['Field']});
  var fdGroup = fdDim.group();
  var mesDim = cf.dimension(function(d) {return d['Drivers']});
  var mesGroup = mesDim.group();
  var whatDimension = cf.dimension(function (d){return d['Block']});
  var whoDimension = cf.dimension(function(d){return (d['Pillar'])});
  var whatGroup = whatDimension.group();
  var whoGroup = whoDimension.group();
  
 
  dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);

//pie charts
   fd.width($('#Field').width()).height(150)
         .dimension(fdDim)
         .group(fdGroup);
            
         
    
   ind.width($('#indicator').width()).height(150)
         .dimension(indDimension)
         .group(indGroup);
// rowCharts
    
   mes.width(400).height(400)
            .dimension(mesDim)
            .group(mesGroup)
             .elasticX(true)
             .data(function(group) {
                return group.top(15);
            })
            .colors('#ecba78')
            .colorAccessor(function(d, i){return 0;});


  whoChart.width(400).height(400)
            .dimension(whoDimension)
            .group(whoGroup)
             .elasticX(true)
             .data(function(group) {
                return group.top(15);
            })
            .colors('#ecba78')
            .colorAccessor(function(d, i){return 0;});
    
  whatChart.width(400).height(400)
            .dimension(whatDimension)
            .group(whatGroup)
             .elasticX(true)
             .data(function(group) {
                return group.top(15);
            })
            .colors('#ecba78')
            .colorAccessor(function(d, i){return 0;});
    
//data table
    dataTab1
        .size(600)
        .dimension(mapDimension)
        .group(function (d) {
            return d.mapGroup;
        })
        .columns([
                    function (d) {
                return d.Date;
                },
                    function (d) {
                return d.Indicator;
                },
                 
                             
                function (d) {
                return d.Justification;
                }
])
    
    
    
    
       impactMap.width($('#Map').width()).height(100)
             .dimension(mapDimension)
             .group(mapGroup)
             //.label(function (p) { return p.key; })
//.renderTitle(true)
             .center([0,0])
             .zoom(0)
             .geojson(vargeodata)
             .colors(['#dadada', '#F17471'])
             .renderTitle(true)
             .label(function (p) {
            return p.key;
        })
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
            var c = 0
            if (d > 0) {
                c = 1;
            } else if (d < 0) {
                c = 0;
            } 
            return c

        })
        .featureKeyAccessor(function (feature) {
            return feature.properties['country_code'];
        }).popup(function (d) {
            return '<h5>'+ d.properties['country_name']+ '</h5>' ;
        })
        
        .featureOptions({
            'fillColor': 'gray',
            'color': 'gray',
            'opacity': 0.1,
            'fillOpacity': 0.1,
            'weight': 0.1
        })
        .renderPopup(true);
     

      dc.renderAll();

      var map = impactMap.map({ 
        
      });
    

      zoomToGeom(vargeodata);
      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]])
           .setZoom(6)
           .setView([10, 10], 2)
           .keyboard.disable()
           .dragging.disable();
      }
   
        
      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['country_code']] = String(e.properties['country_name']);
        });
        return lookup ;
      }
}


     

var dataCall = $.ajax({
    type: 'GET',
    url: 'data/impactsdata.json',
    dataType: 'json',
});

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/world.geojson',
    dataType: 'json',
});

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['country_code'] = String(e.properties['country_code']);
    });
    generateringComponent(dataArgs[0],geom);
});
