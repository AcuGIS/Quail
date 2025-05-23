L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },
  
  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },
  
  getFeatureInfo: function (evt) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
        var err = typeof data === 'string' ? null : data;
        showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        showResults(error);  
      }
    });
  },
  
  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),
        
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,      
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: 'text/html'
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
    
    // return this._url + L.Util.getParamString(params, this._url, true);
    
    var url = this._url + L.Util.getParamString(params, this._url, true);
	  
	  
	  /**
	   * CORS workaround (using a basic php proxy)
	   * 
	   * Added 2 new options:
	   *  - proxy
	   *  - proxyParamName
	   * 
	   */
	   
	  // check if "proxy" option is defined (PS: path and file name)
	  if(typeof this.wmsParams.proxy !== "undefined") {
		  
		  // check if proxyParamName is defined (instead, use default value)
  		if(typeof this.wmsParams.proxyParamName !== "undefined")
  			this.wmsParams.proxyParamName = 'url';
  		
  		// build proxy (es: "proxy.php?url=" )
  		_proxy = this.wmsParams.proxy + '?' + this.wmsParams.proxyParamName + '=';
  		
  		url = _proxy + encodeURIComponent(url);
  		
  	} 
  	
  	return url;
    
  },
  
  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); return; } // do nothing if there's an error
    if(!content.includes("class='layer-title'") && !content.includes("<TR><TH>")){
      return;
    }   

    // replace image paths with HTML image link
    content = content.replace(/(DCIM\/.*\.(jpg|jpeg|png|webp|gif))/i, '<a href="img_filep.php?f=$1" target="_blank"><img src="img_filep.php?f=$1" alt="$1" height="100"/></a>');

    // Otherwise show the content in a popup, or something.
    L.popup({ maxWidth: 800})
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this._map);
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
