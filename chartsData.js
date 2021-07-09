var Chart = require("chart.js");

function handleAnalysisSelectChange(e) {
    var title = e.options[e.selectedIndex].text;
    anlysisDetHeader.innerText = `${title} Breakdown`;
    analysisOverHeader.innerText = `${title} Overview`;

}

function makeCharts() {
    let currentPoint = document.getElementById("currentPoint");
    let maxpts = document.getElementById("maxpts");
    pt = 0;
    let rndArrLength = rndLn();
    let rndArr = rndArrGen(rndArrLength);

    const colors = {
        ootPlus: {
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
        ootNeg: {
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
        warn: {
            borderColor: "rgba(255, 206, 86, 1)",
            backgroundColor: "rgba(255, 206, 86, 0.2)",
        },
        inTol: {
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
    };
    const random = (max = 1) => {
        return Math.round(Math.random() * max) + 14;
    };
    maxpts.innerText = `${rndArrLength}`;

    /*Function to update the bar chart*/
    function updateBarGraph(chart, label, border, bg, data) {
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].backgroundColor.shift();
        chart.data.datasets[0].borderColor.shift();
        chart.data.labels.shift();
        chart.data.datasets[0].data.push(data);
        chart.data.labels.push(label);
        chart.data.datasets[0].backgroundColor.push(bg);
        chart.data.datasets[0].borderColor.push(border);
        currentPoint.innerText = `${pt}/${rndArrLength}`;
        currentPoint.classList.remove("text-gray-600");
        currentPoint.classList.add("text-gray-200");
        chart.update();
    }

    /*Updating the bar chart with updated data in every second. */
    let sessionIntv = setInterval(function () {
        pt++;
        let border;
        let bg;
        let label;
        newDataPt = randomDec();

        if (newDataPt > 0.005) {
            border = colors.ootPlus.borderColor;
            bg = colors.ootPlus.backgroundColor;
            label = "+";
        }
        if (newDataPt < -0.005) {
            border = colors.ootNeg.borderColor;
            bg = colors.ootNeg.backgroundColor;
            label = "-";
        }
        if (newDataPt < 0.0045 && newDataPt > -0.0045) {
            border = colors.inTol.borderColor;
            bg = colors.inTol.backgroundColor;
            label = "ok";
        } else {
            border = colors.warn.borderColor;
            bg = colors.warn.backgroundColor;
            label = "w";
        }
        // console.log(newDataPt)

        updateBarGraph(smBarChart, label, border, bg, newDataPt);
    }, 800);

    //Get random ln
    function rndLn() {
        return Math.floor(Math.random() * (1732 - 288) + 288);
    }

    //Get random meas #
    function randomDec() {
        return (Math.random() * 0.009 - 0.002).toFixed(4);
    }

    // Get a Random Array of example data
    function rndArrGen(len) {
        let rndArr = new Array(len);
        for (var i = 0; i < len; i++) {
            rndArr[i] = randomDec();
        }
        return rndArr;
    }
    const map = rndArr.map((x, index) => {
        return index;
    });
    var analysisCompLine = new Chart(document.getElementById("analysisCompLine"), {
        type: "line",
        data: {
            labels: rndArr.map((x, index) => {
                return `point_${index}`;
            }),
            datasets: [
                {
                    data: rndArr,
                    borderColor: colors.inTol.borderColor,
                    backgroundColor: colors.inTol.backgroundColor,
                    fill: "origin",
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    max: 30,
                    min: 0,
                    ticks: {
                        stepSize: 50,
                        color: "#D1D5DB",
                    },
                },
                y: {
                    max: 0.01,
                    min: -0.01,
                    ticks: {
                        stepSize: 0.005,
                        color: "#D1D5DB",
                    },
                },
            },
        },
    });

    /*Creating the bar chart*/
    var smBarChart = new Chart(document.getElementById("smBarChart"), {
        type: "bar",
        data: {
            labels: [null, null, null, null, null, null],
            datasets: [
                {
                    backgroundColor: [null, null, null, null, null, null],
                    borderColor: [null, null, null, null, null, null],
                    label: [null, null, null, null, null, null],
                    data: [null, null, null, null, null, null],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },                    

                title: {
                    display: true,
                    text: "Temp simulated data",
                    color: "#D1D5DB",
                    position: 'bottom',
                    // weight: 'bold',
                    font:{
                        weight: 'lighter',
                        style: 'italic',
                        size: '16',
                        family: 'Helvetica',
                    
                    }
                },
            },
            scales: {
                y: {
                    max: 0.01,
                    min: -0.01,
                    ticks: {
                        color: "#D1D5DB",
                        stepSize: 0.005,
                    },
                },
                x: {
                    ticks: {
                        color: "#D1D5DB",
                    },
                },
            },
        },
    });
    var hbarChart = new Chart(document.getElementById("hbarChart"), {
        type: "bar",
        data: {
            labels: ["analysis1", "analysis2", "analysis3"],
            datasets: [
                {
                    data: rndArr.slice(0, 3),
                    backgroundColor: [
                        "rgba(99, 40, 132, 0.2)",
                        "rgba(44, 22, 244, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                    ],
                    borderColor: [
                        "rgba(99, 40, 132, 1)",
                        "rgba(44, 22, 244, 1)",
                        "rgba(75, 192, 192, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            indexAxis: "y",
            maintainAspectRatio: false,
   
            scales: {
                y: {
                    display: true,
                    ticks: {
                        color: "#D1D5DB",
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Average Deviation",
                    },
                    reverse: true,
                    display: true,
                    ticks: {
                        color: "#D1D5DB",
                    }
                },


                ticks: {
                    display: false,
                },
            },
            plugins: {
                legend: {
                    display: false,
                    reverse: true,
     
                },
            },
        },
    });

    var donutChart = new Chart(document.getElementById("donutChart"), {
        type: "pie",
        data: {
            labels: ["Faro Arm", "API Radian II", "Mouse Device"],
            datasets: [
                {
                    label: "Population (millions)",
                    backgroundColor: [
                        colors.ootNeg.backgroundColor,
                        colors.ootPlus.backgroundColor,
                        colors.inTol.backgroundColor,
                    ],
                    borderColor: [
                        colors.ootNeg.borderColor,
                        colors.ootPlus.borderColor,
                        colors.inTol.borderColor,
                    ],
                    data: [2478, 5267, 734],
                },
            ],
        },
        options: {
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true,
                    fontColor: "#D1D5DB",
                    labels: {
                        color: "#D1D5DB",
                        weight:"lighter",

                        font: {
                            size: "16px",
                        },
                    },
                },
            },
            scales: {
                y: {
                    display: false,
                },
                x: {
                    display: false,
                },

                ticks: {
                    display: false,
                },
            },
        },
    });

    function getCharts() {
        Chart.helpers.each(Chart.instances, function (instance) {
            return instance
        });
    };
}
