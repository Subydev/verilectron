var net = require("net");
const { dialog } = require("electron").remote;
var showdown = require("showdown");
var fs = require("fs");
var format = require("xml-formatter");

var client;
var connection = false;
var client_message = "";
var server_message = "";

$(function () {
    console.log("ready!");
    Connect();
    SendCommand("<measure_get_point_mode />")

    setInterval(function () {
        SendCommand("<device_info id='1' />")
    }, 200);
});

function Connect() {
    if (client_message.length == undefined) {
    }
    if (connection == false) {
        client = net.createConnection(33666, "localhost");
        client.on("error", function (err) {
            client_message = "Verisurf Connection Failed";
            UpdateTextarea();
            console.log(err);
        });
        client.on("connect", function () {
            client_message = "Verisurf Connection Opened";
            connection = true;
        });
        client.on("data", function (data) {
            server_message = data;
            UpdateTextarea();
        });
        client.on("close", function () {
            connection = false;
        });
    } else {
        client_message = "Verisurf Connection Already Established";
        UpdateTextarea();
    }
}

function Disconnect() {
    if (client) {
        client_message = "Verisurf Connection Closed";
        UpdateTextarea();

        client.destroy();
        client = undefined;
    }
}

function SendCommand(command) {
    if (client !== undefined && command !== undefined) {
        client.write(command + "\n");
        client_message = command;

        if (command.includes("trigger")) {
            $('#droTextContainer').addClass('flashRed');
            setTimeout(function () {
                $('#droTextContainer').removeClass('flashRed');
            }, 200);
        }
    }
}

function HandleRequiredResponses(rawResponse) {
    var fromBuffer = Buffer.from(rawResponse).toString();
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(fromBuffer, "text/xml");

    if (fromBuffer && fromBuffer.includes("data")) {
        var cmdReceived = xmlDoc.getElementsByTagName("command_received")[0].childNodes[0].nodeValue
        var data = xmlDoc.getElementsByTagName("data")[0].childNodes[0].nodeValue
        switch (cmdReceived) {

            case "measure_get_point_mode":
                $('#pointModeSelect').val(data)
                break;
            case "device_info":
                // Handle Build Readout
                if (fromBuffer.includes("DY")) {
                    xValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["DX"].nodeValue
                    yValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["DY"].nodeValue
                    zValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["DZ"].nodeValue
                    zValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["D3"].nodeValue

                    if ($("#dText").hasClass("build")) {
                        $("#xText").text("DX");
                        $("#yText").text("DY");
                        $("#zText").text("DZ");
                        $("#dText").removeClass("build");
                        $("#zTextVal").removeClass("build");
                    }
                    $("#xTextVal").text(parseFloat(xValue).toFixed(4));
                    $("#yTextVal").text(parseFloat(yValue).toFixed(4));
                    $("#zTextVal").text(parseFloat(zValue).toFixed(4));
                    $("#dTextVal").text(parseFloat(zValue).toFixed(4));

                }
                else {
                    if (!$("#dText").hasClass("build")) {
                        $("#xText").text("X");
                        $("#yText").text("Y");
                        $("#zText").text("Z");
                        $("#dTextVal").addClass("-.----");
                        $("#dText").addClass("build");
                        $("#dTextVal").addClass("build");
                    }
                    xValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["X"].nodeValue
                    yValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["Y"].nodeValue
                    zValue = xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["Z"].nodeValue
                    $("#xTextVal").text(parseFloat(xValue).toFixed(4));
                    $("#yTextVal").text(parseFloat(yValue).toFixed(4));
                    $("#zTextVal").text(parseFloat(zValue).toFixed(4));
                }
                break;
        }
    }
}

function UpdateTextarea() {
    var update = '';
    if (client_message.length)
        update += "CLIENT: " + client_message + "\r\n\r\n";
    if (server_message.length)
        update += "SERVER: " + server_message;
    if (server_message.length && server_message.includes("data"))
        HandleRequiredResponses(server_message)
    client_message = '';
    server_message = '';

    $("#results").val(update);
}


function togglePointMode() {
    var measType = document.getElementById("pointModeSelect");
    console.log(measType.value)
    switch (measType.value) {
        case "0":
            SendCommand("<Measure_Set_Single />")
            break;
        case "1":
            SendCommand("<measure_set_cloud />")
            break;
        case "2":
            SendCommand("<measure_set_average />")
            break;
    }
}
