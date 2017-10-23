/**
 * Gets a quote via JSON.
 */
  function search(name, array) {
    //console.log("searching for: " + name);
    var name_upper = name.toUpperCase();
    var begin = 0;
    var end = array.length - 1;
    var middle = 0;
    while (end >= begin) {
      middle = Math.round((end + begin)/2);
      //console.log("middle array is: " + array[middle]["country"] + " and middle is: " + middle);
      if (name_upper > array[middle]["country"]) {
        begin = middle + 1;
        //console.log("name_upper is higher");
      } else if (name_upper < array[middle]["country"]) {
        end = middle - 1;
        //console.log("name_upper is lower");
      } else {
        //console.log("it worked!: evaluation is "+ array[middle]["evaluation"]+ " and currency is: "+ array[middle]["symbol"]);
        return(array[middle])};
    };
    /*console.log("it didn't work for: " + name_upper);
    console.log("how about higher: "+array[middle+1]["country"]);
    console.log("...or lower: "+array[middle-1]["country"]);*/
    return(0);
  };
  
  function evaluate(value) {
    if (value > 1.1) {return('#00ff00');}
    else if (value >= 1) {return('#c3ffb7');}
    else if (value > 0.9) {return('#f2f922');}
    else if (value < 0.9) {return('#ff0000');}
    else {return('#d3d3d3');}
  };
  
  function open_modal(title, content) {
    var options = {
      width: 450,
      height: 280,
      closeOnClick: false,
      draggable: true,
      overlay: false
    }
    var myModal = new jBox('Modal',options);
    myModal.setTitle(title).setContent(content, true);
    myModal.open();
  }
  
  function generator(obj) {
    var output ='';
    var key;
    if (obj != null) {
      var propNames = Object.getOwnPropertyNames(obj);
      propNames.forEach(function(name) {
        if (name != "Name") {
          if (!(isNaN(obj[name]))) {
            key = obj[name].toFixed(3);
          } else {key = obj[name]};
          output = output + '<p><b>' + name + '</b>: ' + key + '</p>';
        };
      });
    } else {output = "Data is not available.";};
    return output;
  }

  function create_modal(title, haystack) {
    var content = "";
    var result = haystack.filter(function(example) {
      return example["Name"] == title;
    });
    content = generator(result[0]);
    open_modal(title,content);
  }
  