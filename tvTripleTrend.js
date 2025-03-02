// Triple Trend
// xCoreng ABrandaol
//

//Events
//-------------
//Entry Long
//Entry Short
//Trend changed
//Trend Up
//Trend Down
//Cross Up
//Cross Down
//Reversal Up
//Reversal Down

//@version=6
indicator('tvTripleTrend.00.00.06', overlay = true, max_labels_count = 500)

// ＩＮＰＵＴＳ ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――{
int len = input.int(120, 'Length', minval = 20, group = 'Bands')
float Bands_dist = input.float(3, 'Bands Distance', step = 0.1, minval = 2, group = 'Bands')
string option_ma = input.string('sma', 'MA type', ['sma', 'ema', 'wma'], group = 'Bands')

string option_signal = input.string('2', 'Signal Type', ['1', '2', '3', 'all'])
color col1 = input.color(#1fa075, '', group = 'Color', inline = '1')
color col2 = input.color(color.rgb(173, 119, 37), '', group = 'Color', inline = '1')
bool bar_col = input.bool(false, 'Bars Color')
// }


// ＣＡＬＣＵＬＡＴＩＯＮＳ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――{
ma = switch option_ma
    'wma' => ta.wma(close, len)
    'sma' => ta.sma(close, len)
    'ema' => ta.ema(close, len)

float min = -1
float max = -1
float priceRef = 0

max := max[1]
min := max[1]
priceRef := priceRef[1]

if((max < close) or (max <= 0))
    max := close
if((min > close)  or (min <= 0))
    min := close

trend(src) =>
    float atr = ta.atr(200)
    float upper = src + atr * Bands_dist
    float lower = src - atr * Bands_dist
    float band1 = 0.
    float band2 = 0.
    float band3 = 0.

    var trend = bool(na)

    if ta.crossover(close, upper)
        trend := true
        trend        
        alert("Cross Up;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
    if ta.crossunder(close, lower)
        trend := false
        trend
        alert("Cross Down;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))

    switch 
        trend => 
    	    band1 := lower
    	    band2 := lower + atr * 1.5
    	    band3 := lower + atr * 3
    	    band3
            if(close >= priceRef)
                alert("Trend Up;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
            if(close < priceRef)    
                alert("Reversal Up;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
            
        not trend => 
    	    band1 := upper
    	    band2 := upper - atr * 1.5
    	    band3 := upper - atr * 3
    	    band3
            if(close <= priceRef)
                alert("Trend Down;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
            if(close > priceRef)    
                alert("Reversal Down;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
            
    [band1, band2, band3, trend, atr]

[band1, band2, band3, trend, atr] = trend(ma)

trend_chage = trend != trend[1]

if(trend_chage)
    min := close
    max := close
    priceRef := close

// Triple signals
signal(txt, band) =>
    var count1 = 0
    var count2 = 0

    if ta.crossunder(high, band) and count1 == 0 and not trend and not trend_chage //and band < band[2]
        label.new(bar_index - 1, high[1], txt, style = label.style_label_down, color = color.new(col2, 25), textcolor = chart.fg_color, size = size.small)
        alert("Entry Short;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
        count1 := 1
        count1

    if close < band and not (count1 == 0)
        count1 := count1 + 1
        if count1 == 10
            count1 := 0
            count1

    if ta.crossover(low, band) and trend and not trend_chage and count2 == 0
        label.new(bar_index - 1, low[1], txt, style = label.style_label_up, color = color.new(col1, 25), textcolor = chart.fg_color, size = size.small)
        alert("Entry Long;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
        count2 := 1
        count2

    if close > band and not (count2 == 0)
        count2 := count2 + 1
        if count2 == 10
            count2 := 0
            count2

switch option_signal
    '1' => signal('1', band3)
    '2' => signal('2', band2)
    '3' => signal('3', band1)
    'all' => 
	    signal('1', band3)
	    signal('2', band2)
	    signal('3', band1)
	    // }

// ＰＬＯＴ ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――{
color t_color = trend_chage ? color(na) : close > band1 ? col1 : col2
p1 = plot(band1, color = trend_chage ? color(na) : close > band1 ? col1 : col2, title = 'THMA.3', linewidth = 3)
p2 = plot(band2, color = trend_chage ? color(na) : close > band1 ? color.new(col1, 25) : color.new(col2, 25), title = 'THMA.2', linewidth = 2)
p3 = plot(band3, color = trend_chage ? color(na) : close > band1 ? color.new(col1, 50) : color.new(col2, 50), title = 'THMA.1', linewidth = 1)

if trend_chage
    line.new(bar_index - 1, band3 + atr * 5, bar_index - 1, band3 - atr * 5, color = color.new(close > band1 ? col1 : col2, 0), style = line.style_dashed)
    alert("Trend Changed;" + str.tostring(close) + ";" + str.tostring(priceRef) + ";"+ str.tostring(min) + ";" + str.tostring(max) + ";" + str.tostring(time))
// fill(p1, p3, band1, band3 + (trend ? atr : -atr), color.new(t_color, 80), na)
barcolor(bar_col ? t_color : na)

if barstate.islast
    label.delete(label.new(bar_index, band1, '1', style = label.style_label_left, textcolor = t_color, color = color(na))[1])
    label.delete(label.new(bar_index, band2, '2', style = label.style_label_left, textcolor = t_color, color = color(na))[1])
    label.delete(label.new(bar_index, band3, '3', style = label.style_label_left, textcolor = t_color, color = color(na))[1])

// }
