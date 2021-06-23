const VSApiFuncs = [
// <! -- CAD Category -->

    {
        name:"Back View",
        val:"<cadview_back />"
    },
    {
        name:"Front View",
        val:"<cadview_front />"
    },
    {
        name:"Bottom View",
        val:"<cadview_bottom />"
    },
    {
        name:"Top View",
        val:"<cadview_top />"
    },
    {
        name:"Iso View",
        val:"<cadview_iso />"
    },
    {
        name:"Left View",
        val:"<cadview_left />"
    },
    {
        name:"Right View",
        val:"<cadview_right />"
    },
    {
        name:"Pan Down",
        val:"<cadview_pandown />"
    },
    {
        name:"Pan Left",
        val:"<cadview_panleft />"
    },
    {
        name:"Pan Right",
        val:"<cadview_panright />"
    },
    {
        name:"Pan Up",
        val:"<cadview_panup />"
    },
    {
        name:"Rotate Down",
        val:"<cadview_rotatedown />"
    },
    {
        name:"Rotate Left",
        val:"<cadview_rotateleft />"
    },
    {
        name:"Rotate Right",
        val:"<cadview_rotateright />"
    },
    {
        name:"Rotate Up",
        val:"<cadview_rotateup />"
    },
    {
        name:"Fit Screen",
        val:"<cadview_fitscreen />"
    },
    {
        name:"Shaded",
        val:"<cadview_shaded />"
    },
    {
        name:"Outline",
        val:"<cadview_shaded_outline />"
    },
    {
        name:"Wireframe",
        val:"<cadview_wireframe />"
    },
    {
        name:"Zoom-In",
        val:"<cadview_zoomin />"
    },
    {
        name:"Zoom-Out",
        val:"<cadview_zoomout />"
    },
    {
        name:"Zoom Probe",
        val:"<cadview_zoomprobe />"
    },

    // <! -- General Category -->
    {
        name:"Version",
        val:"<version />"
    },
    {
        name:"Close Verisurf",
        val:"<close_verisurf />"
    },
    {
        name:"File Open",
        val:"<file_open />"
    },
    {
        name:"File Save",
        val:"<file_save />"
    },
    {
        name:"Import Cloud Mesh",
        val:"<import_cloud_mesh />"
    },
    {
        name:"Import Data",
        val:"<import_data />"
    },
    {
        name:"Command List",
        val:"<command_list />"
    },
    {
        name:"Screenshot",
        val:"<screenshot />"
    },
    {
        name:"Settings Get -- WIP",
        val:"<settings_get />"
    },
    {
        name:"Settings Set -- WIP",
        val:"<settings_set />"
    },
    {
        name:"System Get -- WIP",
        val:"<system_get />"
    },
    {
        name:"Selector Format -- WIP",
        val:"<selector_format />"
    },
        // <! -- Device Category-->

    {
        name:"Abort",
        val:"<device_abort />"
    },
    {
        name:"Aim Device",
        val:"<device_aim />"
    },
    {
        name:"Send I++ Command",
        val:"<device_cmm_ipp />"
    },
    {
        name:"Find Reflector",
        val:"<device_find_reflector />"
    },
    {
        name:"Home Device",
        val:"<device_home />"
    },
    {
        name:"Device Info",
        val:"<device_info />"
    },
    {
        name:"Device List",
        val:"<device_list />"
    },
    {
        name:"Device Probe Mode -- WIP",
        val:"<device_probe_mode />"
    },
    {
        name:"Device Settings -- WIP",
        val:"<device_settings />"
    },
    {
        name:"Device Start",
        val:"<device_start />"
    },
    {
        name:"Device Stop",
        val:"<device_stop />"
    },
            // <! -- Measure Category-->
    {
        name:"Measure Point",
        val:"<measure_point />"
    },
    {
        name:"Measure Line",
        val:"<measure_line />"
    },
    {
        name:"Measure Circle",
        val:"<measure_circle />"
    },
    {
        name:"Measure Spline",
        val:"<measure_spline />"
    },
    {
        name:"Measure Ellipse",
        val:"<measure_ellipse />"
    },
    {
        name:"Measure Slot",
        val:"<measure_slot />"
    },
    {
        name:"Measure Plane",
        val:"<measure_plane />"
    },
    {
        name:"Measure Sphere",
        val:"<measure_sphere />"
    },
    {
        name:"Measure Cylinder",
        val:"<measure_cylinder />"
    },
    {
        name:"Measure Cone",
        val:"<measure_cone />"
    },
    {
        name:"Build",
        val:"<build />"
    },
    {
        name:"Cancel",
        val:"<measure_cancel />"
    },
    {
        name:"Done",
        val:"<measure_done />"
    },
    {
        name:"Get Point Mode",
        val:"<measure_get_point_mode />"
    },
    {
        name:"Set Average",
        val:"<measure_set_average />"
    },
    {
        name:"Set Cloud",
        val:"<measure_set_cloud />"
    },
    {
        name:"Set Single",
        val:"<measure_set_single />"
    },
    {
        name:"Trigger",
        val:"<measure_trigger />"
    },
                // <! -- VS Database Category-->

    {
        name:"Object Delete",
        val:"<object_delete />"
    },
    {
        name:"Object Info",
        val:"<object_info />"
    },
    {
        name:"Object List",
        val:"<object_list />"
    },
    {
        name:"Selection Clear",
        val:"<object_selection_clear />"
    },
    {
        name:"Selection Set",
        val:"<object_selection_set />"
    },
    {
        name:"Set Alignment ---WIP",
        val:"<object_set_alignment />"
    },
    {
        name:"Register Global",
        val:"<register_global />"
    },
    {
        name:"Register Nominal",
        val:"<register_nominal />"
    },
    {
        name:"Analyze",
        val:"<analyze />"
    },
                    // <! -- VS Report Category-->

    {
        name:"Create Report",
        val:"<report_create />"
    },
    {
        name:"Generate Report",
        val:"<report_generate />"
    },
    {
        name:"Plan Stop",
        val:"<inspect_plan_stop />"
    },
    {
        name:"Plan Start",
        val:"<inspect_plan_start />"
    },
    {
        name:"Plan Set Header -- WIP",
        val:"<inspect_plan_set_header />"
    },
    {
        name:"Plan Run Offline",
        val:"<inspect_plan_run_offline />"
    },
    {
        name:"Plan Load",
        val:"<inspect_plan_load />"
    },
    {
        name:"Plan List",
        val:"<inspect_plan_list />"
    },
    {
        name:"Plan Info",
        val:"<inspect_plan_info />"
    },
    {
        name:"Plan Clear All",
        val:"<inspect_plan_clear_all />"
    },
    {
        name:"Inspect Object Measure",
        val:"<inspect_object_measure />"
    },
    {
        name:"Inspect Object Info",
        val:"<inspect_object_info />"
    },
    {
        name:"Inspect Object Clear",
        val:"<inspect_object_clear />"
    }
    
]