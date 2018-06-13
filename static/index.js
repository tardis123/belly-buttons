// Initialize website with data for sample value BB_940
function init(){
var init_sample = 'BB_940';
    SampleData(init_sample);
    PieChart(init_sample);
    BubbleChart(init_sample);
    Gauge(init_sample);
};

init();

// Populate option list with sample values
function SamplesList() {
    // Refer to option list on index.html
    var selDataset = document.getElementById('selDataset');
    // Refer to names route and populate option list
    Plotly.d3.json("/names", function(error, samples) {
        if (error) return console.warn(error);
        for (var i = 0; i < samples.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = samples[i];
            currentOption.value = samples[i]
            selDataset.appendChild(currentOption);
        }
    })
}
SamplesList();

// Rebuild sample metadata and charts after selecting sample value
function optionChanged(sample) {

    SampleData(sample);
    PieChart(sample);
    BubbleChart(sample);
    Gauge(sample);
}

// SAMPLE DATA
function SampleData(sample) {
    // Refer to metadata route and populate table
    var url = `/metadata/${sample}`;
    d3.json(url, function (error, data) {

        // Remove sample_metadate elements for previous metadata
        d3.select('#sample_metadata').html("");
        // Grab metadata JSON key and values data
        var key_metadata = d3.keys(data[0]);
        var value_metadata = d3.values(data[0]);
        // Zip key and value data
        x = d3.zip(key_metadata, value_metadata);
        //console.log(key_metadata)
        //console.log(value_metadata)
        //console.log(x)

            // Set focus on sample_metadata div section and append sample values
            d3.select("#sample_metadata")
            .selectAll('div')
            .data(x)
            .enter()
            .append('h6')
            .text(function(d){return d[0] + ": " + d[1];});
        });   
};

// CHARTS

// Create pie chart
function PieChart(sample) {
    // Refer to samples route and populate table
    var url = `/samples/${sample}`;
   
    d3.json(url, function (error, data) {
        if (error) return console.warn(error);
        // Remove sample_metadata elements for previous metadata
        d3.select('#pie').html("");
        // Grab JSON metadata key and values data
        
        var ids = d3.values(data[1]); // OTU id
        var values = d3.values(data[0]); //sample value

        // Loop through JSON metadata key and values and add to arrays
        for (var i = 0; i < ids.length;  i++) {
            var pie_ids = ids[i]; //a
            var pie_values = values[i]; //b
            } 
            ;
        
        //console.log(pie_ids)
        //console.log(pie_values)
       
        // Get taxonomic OTU names
        d3.json("/otu", function(error, data) {
            if (error) console.log(error);
    
            // Get pie chart labels
            var pie_labels = [];
            for (var i = 0; i < pie_ids.length; i++) {
                pie_labels.push(data[pie_ids[i]]);
            };
        
            // Set focus on pie div section and generate pie chart
            d3.select("#pie")
            .selectAll('div')
            .data(data)
            .enter()

            // DATA part (trace)
            var trace1 = [{
                values: pie_ids.slice(0,10),
                labels: pie_values.slice(0,10),
                hovertext: pie_labels.slice(0,10),
                textposition: 'right',
                hoverinfo: 'hovertext',
                type: 'pie'
            }]

            // LAYOUT part
            var layout = {
                
                };

            Plotly.newPlot("pie", trace1, layout); 
    
            });
    });
};

// Create bubble chart
function BubbleChart(sample) {
    
    // Refer to sample route and populate table
    var url = `/samples/${sample}`;
    
    d3.json(url, function (error, data) {
        if (error) return console.warn(error);
        // Remove sample_metadate elements for previous metadata
        d3.select('#bubbles').html("");
        // Grab JSON metadata key and values data
        var values = d3.values(data[0]); //sample value
        var ids = d3.values(data[1]); // OTU id
        
        for (var i = 0; i < ids.length;  i++) {
            var bubble_values = values[i];
            var bubble_ids = ids[i];
            } 
            ;
        
        // Get taxonomic OTU names
        d3.json("/otu", function(error, data) {
            if (error) console.log(error);
    
            // Get bubble chart labels
            var bubble_labels = []; //hoverinfo
            for (var i = 0; i < bubble_ids.length; i++) {
                bubble_labels.push(data[bubble_ids[i]]);
            };
        
            // Set focus on bubble div section and generate bubble chart
            d3.select("#bubbles")
                .selectAll('div')
                .data(data)
                .enter()

            // DATA part (trace)
            var trace1 = [{
                x: bubble_values,
                y: bubble_ids,
                mode: 'markers',
                text: bubble_labels,
                textposition: 'right',
                marker: {
                size: bubble_ids,
                color: bubble_values,
                colorscale: "Earth",
                }
            }] 
                
            // LAYOUT part
            var layout = {
                margin: { t: 0 },
                hovermode: 'closest',
                xaxis: { title: 'OTU ID' }
            };

            Plotly.newPlot("bubbles", trace1, layout); 

        });
    });
};

// Create gauge
function Gauge(sample) {
    
    // Refer to sample route and populate table
    var url = `/wfreq/${sample}`;
    Plotly.d3.json(url, function (error, data) {
        if (error) return console.warn(error);
        // Remove washing frequency elements for previous sample
        //d3.select('#gauge').html("");
                
        console.log(data)

        //Set focus on gauge div section and generate bubble chart
        d3.select("#gauge")
            .selectAll('div')
            .data(data)
            .enter()

        // Convert to gauge scale:
        // Highest washing frequency in the gauge chart is 9
        // In order to match 9 with 180 degrees we need to multiple by 20
        var level = data*20;
        // Trig to calc meter point
        var degrees = 180 - level,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);

        var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 6, color:'850000'},
            showlegend: false,
            name: 'WFREQ',
            text: data,
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:[
                'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];

        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],
        title: '<b>Belly button washing frequency</b><br>scrubs per week',
        height: 500,
        width: 500,
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };

        Plotly.newPlot("gauge", data, layout);

            });
};