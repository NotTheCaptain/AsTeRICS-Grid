!function(t){"function"==typeof define&&define.amd?define(["jquery","grid-list"],t):t(jQuery,GridList)}(function(n,h){function o(t,i,e){this.options=n.extend({},this.defaults,i),this.draggableOptions=n.extend({},this.draggableDefaults,e),this.$element=n(t),this._init(),this._bindEvents()}o.prototype={defaults:{lanes:5,direction:"horizontal",itemSelector:"li[data-w]",widthHeightRatio:1,dragAndDrop:!0},draggableDefaults:{zIndex:2,scroll:!1,containment:"false"},destroy:function(){this._unbindEvents()},resize:function(t){t&&(this.options.lanes=t),this._createGridSnapshot(),this.gridList.resizeGrid(this.options.lanes),this._updateGridSnapshot(),this.reflow()},resizeItem:function(t,i){this._createGridSnapshot(),this.gridList.resizeItem(this._getItemByElement(t),i),this._updateGridSnapshot(),this.render()},reflow:function(){this._calculateCellSize(),this.render()},autosize:function(){this._calculateCellSize(!0),this.render()},fillGaps:function(){this.gridList.fillGaps(),this.render()},resolveCollisions:function(t){this.gridList.resolveCollisions(t),this.render()},render:function(){this._applySizeToItems(),this._applyPositionToItems()},_bindMethod:function(t){var i=this;return function(){return t.apply(i,arguments)}},_init:function(){this.$items=this.$element.children(this.options.itemSelector),this.items=this._generateItemsFromDOM(),this._widestItem=Math.max.apply(null,this.items.map(function(t){return t.w})),this._tallestItem=Math.max.apply(null,this.items.map(function(t){return t.h})),this.$positionHighlight=this.$element.find(".position-highlight").hide(),this._initGridList(),this.autosize(),this.options.dragAndDrop&&this.$items.draggable(this.draggableOptions)},_initGridList:function(){this.gridList=new h(this.items,{lanes:this.options.lanes,direction:this.options.direction})},_bindEvents:function(){this._onStart=this._bindMethod(this._onStart),this._onDrag=this._bindMethod(this._onDrag),this._onStop=this._bindMethod(this._onStop),this.$items.on("dragstart",this._onStart),this.$items.on("drag",this._onDrag),this.$items.on("dragstop",this._onStop)},_unbindEvents:function(){this.$items.off("dragstart",this._onStart),this.$items.off("drag",this._onDrag),this.$items.off("dragstop",this._onStop)},_onStart:function(t,i){this._createGridSnapshot(),this._maxGridCols=this.gridList.grid.length},_onDrag:function(t,i){var e=this._getItemByElement(i.helper),s=this._snapItemPositionToGrid(e);this._dragPositionChanged(s)&&(this._previousDragPosition=s,h.cloneItems(this._items,this.items),this.gridList.generateGrid(),e=this._getItemByElement(i.helper),this.gridList.moveItemToPosition(e,s),this._applyPositionToItems(),this._highlightPositionForItem(e))},_onStop:function(t,i){this._updateGridSnapshot(),this._previousDragPosition=null,n(i.helper).removeClass("ui-draggable-dragging"),this._applyPositionToItems(),this._removePositionHighlight()},_generateItemsFromDOM:function(){var e=[];return this.$items.each(function(t,i){e.push({$element:n(i),x:Number(n(i).attr("data-x")),y:Number(n(i).attr("data-y")),w:Number(n(i).attr("data-w")),h:Number(n(i).attr("data-h")),id:Number(n(i).attr("data-id"))})}),e},_getItemByElement:function(t){for(var i=0;i<this.items.length;i++)if(this.items[i].$element.is(t))return this.items[i]},_calculateCellSize:function(t){if("horizontal"===this.options.direction){if(this._cellHeight=Math.floor(this.$element.height()/this.options.lanes),this._cellWidth=this._cellHeight*this.options.widthHeightRatio,t){var i=Math.max.apply(Math,this.items.map(function(t){return t.x+t.w}));this._cellWidth*i>n("#grid-container").width()&&(this._cellWidth=(n("#grid-container").width()-20)/i)}}else this._cellWidth=Math.floor(this.$element.width()/this.options.lanes),this._cellHeight=this._cellWidth/this.options.widthHeightRatio;this.options.heightToFontSizeRatio&&(this._fontSize=this._cellHeight*this.options.heightToFontSizeRatio)},_getItemWidth:function(t){return t.w*this._cellWidth},_getItemHeight:function(t){return t.h*this._cellHeight},_applySizeToItems:function(){for(var t=0;t<this.items.length;t++)this.items[t].$element.css({width:this._getItemWidth(this.items[t]),height:this._getItemHeight(this.items[t])});this.options.heightToFontSizeRatio},_applyPositionToItems:function(){for(var t=0;t<this.items.length;t++)this.items[t].move||this.items[t].$element.css({left:this.items[t].x*this._cellWidth,top:this.items[t].y*this._cellHeight});if("horizontal"===this.options.direction){Math.max.apply(Math,this.items.map(function(t){return t.x+t.w}));this.$element.width(n(window).width())}else this.$element.height((this.gridList.grid.length+this._tallestItem)*this._cellHeight)},_dragPositionChanged:function(t){return!this._previousDragPosition||(t[0]!=this._previousDragPosition[0]||t[1]!=this._previousDragPosition[1])},_snapItemPositionToGrid:function(t){var i=t.$element.position();i[0]-=this.$element.position().left;var e=Math.round(i.left/this._cellWidth),s=Math.round(i.top/this._cellHeight);return e=Math.max(e,0),s=Math.max(s,0),s="horizontal"===this.options.direction?Math.min(s,this.options.lanes-t.h):(e=Math.min(e,this.options.lanes-t.w),Math.min(s,this._maxGridCols)),[e,s]},_highlightPositionForItem:function(t){this.$positionHighlight.css({width:this._getItemWidth(t),height:this._getItemHeight(t),left:t.x*this._cellWidth,top:t.y*this._cellHeight}).show(),this.options.heightToFontSizeRatio&&this.$positionHighlight.css("font-size",this._fontSize)},_removePositionHighlight:function(){this.$positionHighlight.hide()},_createGridSnapshot:function(){this._items=h.cloneItems(this.items)},_updateGridSnapshot:function(){this._triggerOnChange(),h.cloneItems(this.items,this._items)},_triggerOnChange:function(){"function"==typeof this.options.onChange&&this.options.onChange.call(this,this.gridList.getChangedItems(this._items,"$element"))}},n.fn.gridList=function(t,i){var e,s,h;return"string"==typeof t&&(s=t,h=Array.prototype.slice.call(arguments,1)),this.each(function(){(e=n(this).data("_gridList"))&&!s&&(e.destroy(),e=null),e||(e=new o(this,t,i),n(this).data("_gridList",e)),s&&e[s].apply(e,h)}),this}});