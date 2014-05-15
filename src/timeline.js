/* globals Scroller: true */
/* exported Timeline:true */

(function() {
    "use strict";
    var NOOP = function() {};

    var Timeline = function(container, options) {
        var timeline = this;


        this.options = {
            data: [],
            onItemSelected: NOOP
        };

        for (var key in options) {
            this.options[key] = options[key];
        }

        timeline.data = timeline.options.data;

        /* elements */

        var cellWidth = 100;
        var cellHeight = 20;

        var content = document.getElementById('content');
        var context = content.getContext('2d');
        var tiling = new Tiling();


        /* rendering */

        var cl, ct, cz;

        // Canvas renderer
        function updateViewport(left, top, zoom) {
            cl = left;
            ct = top;
            cz = zoom;
            render();
        }


        function render() {
            // Sync current dimensions with canvas
            content.width = clientWidth;
            content.height = clientHeight;

            // Full clearing
            context.clearRect(0, 0, clientWidth, clientHeight);

            for (var i = 0; i < timeline.data.length; i++) {
                var item = timeline.data[i];

                var nl = 10 - cl + item.start * 10 * cz;
                var nw = item.duration * 10 * cz;
                var nr = nl + nw;
                var il = Math.max(0, nl);
                var it = 10 - ct + item.lane * 22;
                var iw = item.duration * 10 * cz + Math.min(0, nl);

                item.width = item.duration * 10 * cz;
                item.left = nl;
                item.top = it;

                if (nr > 0 && nl < clientWidth) {

                    context.fillStyle = "#ddd";
                    context.fillRect(il, it, iw, 20);

                    context.fillStyle = "black";
                    context.font = (14).toFixed(2) + 'px "Helvetica Neue", Helvetica, Arial, sans-serif';

                    var tw = context.measureText(item.title).width;
                    if (tw < nw) {
                        // inline label
                        var tl = il + 6;
                        if (tl + tw > il + iw) tl = il + iw - 6 - tw;
                        context.textAlign = "left";
                        context.fillText(item.title, tl, it + 16);

                    } else {
                        // vertical label
                        context.save();

                        context.textAlign = "right";
                        context.textBaseline = "middle";
                        context.translate(il + iw / 2, it + 24);
                        context.rotate(-Math.PI / 2);

                        context.fillText(item.title, 0, 0);
                        context.restore();

                    }





                }

            }

        }

        // Initialize Scroller
        var scroller = this.scroller = new Scroller(updateViewport, {
            zooming: true,
            minZoom: 0.00001,
            maxZoom: 500,
            zoomingY: false
        });


        var rect = container.getBoundingClientRect();
        scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);

        var clientWidth = 0;
        var clientHeight = 0;
        var contentWidth = 2000;
        var contentHeight = 2000;

        // Reflow handling
        var reflow = function() {
            clientWidth = container.clientWidth;
            clientHeight = container.clientHeight;
            scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
        };

        window.addEventListener("resize", reflow, false);
        reflow();

        if ('ontouchstart' in window) {

            container.addEventListener("touchstart", function(e) {
                // Don't react if initial down happens on a form element
                if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
                    return;
                }

                scroller.doTouchStart(e.touches, e.timeStamp);
                e.preventDefault();
            }, false);

            document.addEventListener("touchmove", function(e) {
                scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
            }, false);

            document.addEventListener("touchend", function(e) {
                scroller.doTouchEnd(e.timeStamp);
            }, false);

            document.addEventListener("touchcancel", function(e) {
                scroller.doTouchEnd(e.timeStamp);
            }, false);

        } else {

            var mousedown = false;

            container.addEventListener("mousedown", function(e) {
                for (var i = 0; i < timeline.data.length; i++) {
                    var item = timeline.data[i];
                    if (e.offsetX > item.left && e.offsetX < item.left + item.width && e.offsetY > item.top && e.offsetY < item.top + 20) {
                        timeline.options.onItemSelected(item);
                        // return here to cancel scroll
                        //return;
                    }
                }

                scroller.doTouchStart([{
                    pageX: e.pageX,
                    pageY: e.pageY
                }], e.timeStamp);

                mousedown = true;
            }, false);

            document.addEventListener("mousemove", function(e) {
                if (!mousedown) {
                    return;
                }

                scroller.doTouchMove([{
                    pageX: e.pageX,
                    pageY: e.pageY
                }], e.timeStamp);

                mousedown = true;
            }, false);

            document.addEventListener("mouseup", function(e) {
                if (!mousedown) {
                    return;
                }

                scroller.doTouchEnd(e.timeStamp);

                mousedown = false;
            }, false);

            container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", function(e) {
                scroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
            }, false);

        }



    };

    Timeline.prototype.setData = function(data) {
        this.data = data;
        this.render();
    };

    window.Timeline = Timeline;
})();