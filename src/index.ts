import { read } from './memory';
import { intel8080 } from './processor/index';


window.onload = () => {

    const intel = intel8080();

    const theCanvas = document.getElementById("screen") as HTMLCanvasElement;
    if(!theCanvas) throw new Error('');
    const context = theCanvas.getContext("2d");
    function render() {
        if(!context) return;

        context.imageSmoothingEnabled= false;
        context.fillStyle = "rgba("+0+","+0+","+0+","+1+")";
        context.fillRect(0,0, 224, 260);
        let counter = 9216;
      
          for(var k = 0; k < 224; k++) {
              
              for(var l = 256; l > 0; l= l - 8) {
      
                  const tempMem = read(counter.toString(16));
                  var val = parseInt("0x" + tempMem);
                  for(var m = 0; m < 8; m++) {
                      var theBit = val & 1;
                      val = val >> 1;
                      if(theBit & 1) {
                          context.fillStyle = "rgba("+0+","+256+","+0+","+1+")";
                          context.fillRect(k,l - m, 1, 1 );
                          
                      }
              
                  }
                  counter = counter + 1;
              }
          }
      }

    const run = () => {
        intel.run();
        render();

        setTimeout(() => {
            run();
        }, 1000/60)
    }
    
    run();
    

}

