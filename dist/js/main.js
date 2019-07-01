var log, trouble,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

window.ASAP = (function() {
    var callall, fns;
    fns = [];
    callall = function() {
        var f, results;
        results = [];
        while (f = fns.shift()) {
            results.push(f());
        }
        return results;
    };
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callall, false);
        window.addEventListener('load', callall, false);
    } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', callall);
        window.attachEvent('onload', callall);
    }
    return function(fn) {
        fns.push(fn);
        if (document.readyState === 'complete') {
            return callall();
        }
    };
})();

log = function() {
    if (window.console && window.DEBUG) {
        if (typeof console.group === "function") {
            console.group(window.DEBUG);
        }
        if (arguments.length === 1 && Array.isArray(arguments[0]) && console.table) {
            console.table.apply(window, arguments);
        } else {
            console.log.apply(window, arguments);
        }
        return typeof console.groupEnd === "function" ? console.groupEnd() : void 0;
    }
};

trouble = function() {
    var ref;
    if (window.console) {
        if (window.DEBUG) {
            if (typeof console.group === "function") {
                console.group(window.DEBUG);
            }
        }
        if ((ref = console.warn) != null) {
            ref.apply(window, arguments);
        }
        if (window.DEBUG) {
            return typeof console.groupEnd === "function" ? console.groupEnd() : void 0;
        }
    }
};

window.preload = function(what, fn) {
    var lib;
    if (!Array.isArray(what)) {
        what = [what];
    }
    return $.when.apply($, (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = what.length; i < len; i++) {
            lib = what[i];
            results.push($.ajax(lib, {
                dataType: 'script',
                cache: true
            }));
        }
        return results;
    })()).done(function() {
        return typeof fn === "function" ? fn() : void 0;
    });
};


String.prototype.zeroPad = function(len, c) {
    var s = '';
    c = c || '0';
    len = (len || 2) - this.length;
    while (s.length < len) s += c;
    return s + this;
};
Number.prototype.zeroPad = function(len, c) { return String(this).zeroPad(len, c); };

Number.prototype.pluralForm = function(root, suffix_list) {
    return root + (this >= 11 && this <= 14 ? suffix_list[0] : suffix_list[this % 10]);
};

Number.prototype.asDays = function() {
    var d = Math.floor(this);
    return d.pluralForm('д', ['ней', 'ень', 'ня', 'ня', 'ня', 'ней', 'ней', 'ней', 'ней', 'ней']).toLowerCase();
};
Number.prototype.asHours = function() {
    var d = Math.floor(this);
    return d.pluralForm('час', ['ов', '', 'а', 'а', 'а', 'ов', 'ов', 'ов', 'ов', 'ов']).toLowerCase();
};
Number.prototype.asMinutes = function() {
    var d = Math.floor(this);
    return d.pluralForm('минут', ['', 'а', 'ы', 'ы', 'ы', '', '', '', '', '']).toLowerCase();
};

function ytPlayback(ytid, placeholder_selector) {
    // window.main_ytplayer && window.main_ytplayer.destroy();
    delete window.main_ytplayer;
    window.main_ytplayer = new YT.Player($(placeholder_selector).get(0), {
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, showinfo: 1, rel: 0, modestbranding: 1 },
        events: {
            onReady: function(e) {
                var plist = ytid.split(',');
                if (plist.length > 1) {
                    window.main_ytplayer.loadPlaylist(plist);
                } else {
                    var id_and_seek = ytid.split(':');
                    if (id_and_seek.length > 1) {
                        window.main_ytplayer.loadVideoById(id_and_seek[0], id_and_seek[1]);
                    } else {
                        window.main_ytplayer.loadVideoById(ytid);
                    }
                }
            },
            onStateChange: function(e) {
                if (e.data == YT.PlayerState.ENDED) {

                }
            }
        }
    });
}


;

ASAP(function() {
    var D, ScheduledLayout, congrats, countdown, inputValid, libs, msk, msk_match, req, stopwatch, timelapse;

    jQuery.fn.swap = function(b) {
        var a, t;
        b = jQuery(b)[0];
        a = this[0];
        t = a.parentNode.insertBefore(document.createTextNode(''), a);
        b.parentNode.insertBefore(a, b);
        t.parentNode.insertBefore(b, t);
        t.parentNode.removeChild(t);
        return this;
    };
    preload('./js/jquery.scrollTo.min.js', function() {
        $(document).on('click', '[data-scrollto]', function() {
            return $(window).scrollTo($(this).data('scrollto'), 500, {
                interrupt: true
            });
        });
        return $('.puzzle-comp video').on('ended', function() {
            return setTimeout(function() {
                return $(window).scrollTo($('section.congrats'), 500, {
                    interrupt: true
                });
            }, 500);
        });
    });
    ScheduledLayout = (function() {
        ScheduledLayout.prototype.defaults = {
            liveUpdateInterval: 0,
            phaseChangeEvent: 'ScheduledLayout.phaseChange'
        };

        function ScheduledLayout(el, options) {
            this.options = $.extend({}, this.defaults, options);
            this.$el = $(el);
            this.init();
        }

        ScheduledLayout.prototype.init = function() {
            this.update(this.options.now || new Date());
            if (this.options.liveUpdateInterval) {
                this.timestamp = this.options.now.getTime();
                return setInterval((function(_this) {
                    return function() {
                        _this.timestamp += _this.options.liveUpdateInterval;
                        return _this.update(new Date(_this.timestamp));
                    };
                })(this), this.options.liveUpdateInterval);
            }
        };

        ScheduledLayout.prototype.update = function(now) {
            var date_since, date_till, phase, ref, ref1, results, terms;
            ref = this.options.config;
            results = [];
            for (phase in ref) {
                if (!hasProp.call(ref, phase)) continue;
                terms = ref[phase];
                date_since = new Date(terms.since || 0);
                date_till = new Date(terms.till || '2100-01-01T00:00:00');
                if ((date_since.getTime() <= (ref1 = now.getTime()) && ref1 < date_till.getTime())) {
                    results.push(this.applyPhase(phase));
                } else if (terms.flag && now.getTime() < date_since.getTime()) {
                    results.push((function(_this) {
                        return function(phase) {
                            return $.ajax(terms.flag, {
                                success: function(data, status, xhr) {
                                    var server_date;
                                    server_date = new Date(xhr.getResponseHeader('Date'));
                                    return _this.applyPhase(phase);
                                }
                            });
                        };
                    })(this)(phase));
                } else {
                    results.push(void 0);
                }
            }
            return results;
        };

        ScheduledLayout.prototype.applyPhase = function(phase) {
            var data_phase_was;
            data_phase_was = this.$el.attr('data-phase') || '';
            this.$el.attr('data-phase', phase);
            if (data_phase_was !== phase) {
                self.console && console.log('+++ apply phase: %o', phase);
                return this.$el.trigger(this.options.phaseChangeEvent, [phase]);
            }
        };

        $.fn.extend({
            ScheduledLayout: function() {
                var args, option;
                option = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
                return this.each(function() {
                    var $this, data;
                    $this = $(this);
                    data = $this.data('ScheduledLayout');
                    if (!data) {
                        $this.data('ScheduledLayout', (data = new ScheduledLayout(this, option)));
                    }
                    if (typeof option === 'string') {
                        return data[option].apply(data, args);
                    }
                });
            }
        });

        return ScheduledLayout;

    })();
    preload('./js/jquery-ui.min.js', function() {
        return preload('./js/jquery.ui.touch-punch.min.js', function() {
            var $hovered, markTiles, shuffle;
            window.$tiles = $('div.puzzle .tile');
            shuffle = function(shuffle_rounds) {
                var results;
                if (shuffle_rounds == null) {
                    shuffle_rounds = Math.round(Math.random() * 27) + 10;
                }
                results = [];
                while (--shuffle_rounds) {
                    results.push($('div.puzzle').append($tiles.eq(Math.round(Math.random() * 8))));
                }
                return results;
            };
            shuffle();
            markTiles = function() {
                return $tiles.each(function(idx, tile) {
                    var $tile, complete;
                    $tile = $(tile);
                    $tile.toggleClass('in-place', $tile.index() === $tiles.index($tile));
                    complete = $tiles.filter('.in-place').length / 9;
                    // $('.puzzle-comp .hilite').css('opacity', complete);
                    if (complete === 1) {
                        $('div.puzzle').addClass('complete');
                        $tiles.draggable('disable');
                        return congrats();
                    }
                });
            };
            markTiles();
            while ($('div.puzzle .tile.in-place').length > 0) {
                shuffle();
                markTiles();
            }
            $hovered = null;
            return $tiles.draggable({
                helper: 'clone',
                containment: 'parent',
                refreshPositions: true,
                start: function(e) {
                    return $(this).addClass('being-dragged');
                },
                stop: function(e) {
                    markTiles();
                    $hovered = null;
                    return $(this).removeClass('being-dragged');
                }
            }).droppable({
                over: function(e) {
                    if ($hovered && $hovered.get(0) !== this) {
                        $hovered.swap($('div.puzzle .tile.being-dragged'));
                    }
                    $hovered = $(this);
                    return $('div.puzzle .tile.being-dragged').swap($hovered);
                }
            });
        });
    });
    D = new Date(Date.parse('2019-02-20T19:00:00.000Z'));
    msk_match = top.location.href.match(/\bmsk=(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    msk = msk_match && new Date(msk_match[1] + '+03:00');
    stopwatch = function() {
        var tick;
        tick = (new Date()).getTime();
        return function() {
            return (new Date()).getTime() - tick;
        };
    };
    timelapse = stopwatch();
    countdown = function() {
        var $legend, days_count, ddiff, hours_count, minutes_count, msecs_per_day, msecs_per_hour, msecs_per_minute, now;
        now = msk && new Date(msk.getTime() + timelapse()) || new Date();
        ddiff = D.getTime() - now.getTime();
        if (ddiff > 0) {
            msecs_per_day = 1000 * 3600 * 24;
            msecs_per_hour = 1000 * 3600;
            msecs_per_minute = 1000 * 60;
            days_count = Math.floor(ddiff / msecs_per_day);
            ddiff -= days_count * msecs_per_day;
            hours_count = Math.floor(ddiff / msecs_per_hour);
            ddiff -= hours_count * msecs_per_hour;
            minutes_count = Math.floor(ddiff / msecs_per_minute);
            $legend = $('.legend');
            $('#_days_count').text(days_count.zeroPad(2));
            $legend.find('.days').text(days_count.asDays());
            $('#_hours_count').text(hours_count.zeroPad(2));
            $legend.find('.hours').text(hours_count.asHours());
            $('#_minutes_count').text(minutes_count.zeroPad(2));
            return $legend.find('.minutes').text(minutes_count.asMinutes());
        }
    };
    countdown();
    setInterval(countdown, 5000);
    congrats = function() {
        $('#_puzzle_form input[name=Email]').val($('#_reminder_form input[name=Email]').val());
        setTimeout(function() {
            if ( $('.congrats .content').hasClass('check_block')) {
                $('.congrats').fadeIn();
            } else {
                $('.check_block').fadeIn();
                $('.puzzle-comp').css('opacity', '0');  
            }
            Check_block();
        }, 3800);
        clearInterval(timeinterval_stopwatch);
        return setTimeout(function() {
            return $('.puzzle-comp').addClass('complete').find('video').get(0).play();
        }, 500);
    }; 
    function Check_block() {
        var percent = 0;
        var Percentinterval = setInterval(updatePercent, 50);
        function updatePercent() {
            $('.line_percent').html(percent + '%');
            $('.line_block').css('width', percent + '%');
            percent++;
            if (percent == 101) {
                clearInterval(Percentinterval);
                $('.content.check_block').fadeOut(1000);
                if ($('.congrats').is(":hidden")) {
                    $('.congrats').fadeIn();
                }
            }
            if (percent == 34 && $('.line_text').is(".step_2")) {
                $('.line_text.step_1').hide();
                $('.line_text.step_2').fadeIn();
                $('.loading.step_1').addClass('loaded');
                $('span.step_1').html($('span.step_1').attr('data_percent'));
                console.log($('span.step_1').attr('data_percent'))
            }
            if (percent == 51 && $('.line_text.step_1').is(":visible")) {
                $('.line_text.step_1').hide();
                $('.line_text.step_3').fadeIn();
                $('.loading.step_1').addClass('loaded')
            }
            if (percent == 67 && $('.line_text').is(".step_2")) {
                $('.line_text.step_2').hide();
                $('.line_text.step_3').fadeIn();
                $('.loading.step_2').addClass('loaded')
            }
            if (percent == 100 && $('.line_text').is(".step_2")) {
                $('.loading.step_3').addClass('loaded')
            }
        }
    }
    $('[data-popin]').click(function() {
        $($(this).data('popin')).addClass('shown');
        return document.body.style.overflow = 'hidden';
    });
    $(document).on('click', '.closer', function() {
        $(this).closest('.shown').removeClass('shown');
        return document.body.style.overflow = '';
    });
    $('#_show_reminder_form').click(function() {
        $(this).closest('div').hide();
        return $('form#_reminder_form').closest('.form-wrap').slideDown();
    });
    return $(document).on('click', '[data-ytid][data-yt-placeholder]', function(e) {
        var $this;
        $this = $(this);
        ytPlayback($this.data('ytid'), $this.data('yt-placeholder'));
        return $this.closest('.ctl-layer').fadeOut(function() {
            return $(this).hide();
        });
    });
});


var timer = function(timer) {

    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        return {
            'total': t,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClock(el, endtime) {
        var minutesSpan = document.querySelector('#_hours_count');
        var secondsSpan = document.querySelector('#_minutes_count');
               
        function updateClock() {
            var t = getTimeRemaining(endtime);
            minutesSpan.textContent = ('0' + t.minutes).slice(-2);
            secondsSpan.textContent = ('0' + t.seconds).slice(-2);
            $('.you_time').html(minutesSpan.textContent + ':' + secondsSpan.textContent);
            if (t.total <= 0) {
                clearInterval(timeinterval);
            }
        }
        updateClock();
        var timeinterval = setInterval(updateClock, 1000);
    }

    var _currentDate = new Date();
    var minutes = 5;
    var seconds = 38;
    var _toDate = new Date(_currentDate.getFullYear(),
        _currentDate.getMonth(),
        _currentDate.getDate(),
        _currentDate.getHours(),
        _currentDate.getMinutes() + minutes,
        _currentDate.getSeconds() + seconds,
        1);
    initializeClock('.b-blackFriday__timer-element', _toDate);
}
var timeinterval_stopwatch;
var stopwatch = function(stopwatch) {
    function getTimeRemaining(endtime) {
        var t = new Date() - new Date(endtime) ;
        var milliseconds = Math.floor((t / 10));
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        // console.log(t + ' = ' + minutes + ' : ' + seconds + ' : ' + milliseconds)
        return {
            'total': t,
            'minutes': minutes,
            'seconds': seconds,
            'milliseconds': milliseconds
        };
    }

    function initializeClock(el, endtime) {
        var minutesSpan = document.querySelector('#_days_count');
        var secondsSpan = document.querySelector('#_hours_count');
        var millisecondsSpan = document.querySelector('#_minutes_count');

        function updateClock() {
            var t = getTimeRemaining(endtime);

            // minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
            // secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
            // millisecondsSpan.innerHTML = ('0' + t.milliseconds).slice(-2);
            minutesSpan.textContent = ('0' + t.minutes).slice(-2);
            secondsSpan.textContent = ('0' + t.seconds).slice(-2);
            millisecondsSpan.textContent = ('0' + t.milliseconds).slice(-2);
            $('.you_time').html(minutesSpan.textContent + ':' + secondsSpan.textContent + ':' + millisecondsSpan.textContent);
            if (t.total <= 0) {
                // clearInterval(timeinterval);
            }
        }
        updateClock();
        timeinterval_stopwatch = setInterval(updateClock, 10);
    }

    var _currentDate = new Date();
    var minutes = 0;
    var seconds = 0;
    var milliseconds = 0;
    var _toDate = new Date(_currentDate.getFullYear(),
        _currentDate.getMonth(),
        _currentDate.getDate(),
        _currentDate.getHours(),
        _currentDate.getMinutes() + minutes,
        _currentDate.getSeconds() + seconds,
        _currentDate.getMilliseconds() + milliseconds,
        1);
    initializeClock('.b-blackFriday__timer-element', _toDate);
}

function leaveComment() {
    var comment = $('.comments__item--leave');
    setTimeout(function() {
        $('.comments__list').prepend(comment)
        comment.fadeIn(500);
    }, 7000)
}

function addComment() {
    var submitComment = $('.comments__form-submit');

    submitComment.on('click', function(event) {
        event.preventDefault();

        var commentsContainer = $('.comments__list'),
            textarea = $('.comments__form-textarea'),
            comment = String(textarea.val()),
            error = $('.comments__form-error'),
            customComment = $('.comments__item--user').clone().removeClass('comments__item--user');

        if (comment) {
            error.fadeOut(100)
            customComment.find('.comments__item-text').text(comment)
            commentsContainer.prepend(customComment)
            customComment.fadeIn(500);
            textarea.val('').focus()
            scrollToEl(commentsContainer, -30)
        } else {
            error.fadeIn(100)
        }
    });
}

var scrollToEl = function(el, offset) {
    $("html,body").animate({ scrollTop: el.offset().top + (offset || 0) }, 500);
}

var instructions = $('section.instructions');

var up = function() {
    var btn = $('.up');

    btn.on('click', function(event) {
        event.preventDefault();
        scrollToEl(instructions)
    });

    $(document).on('scroll', function(event) {
        if (window.pageYOffset > (instructions.offset().top + instructions.innerHeight())) {
            btn.fadeIn(500)
        } else {
            btn.fadeOut(500);
        }
    });
}

$(function() { 
    addComment()
    leaveComment()
    up()
    // timer()
})

