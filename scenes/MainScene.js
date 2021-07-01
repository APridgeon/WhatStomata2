import { initialiseEpidermis } from "../src/epidermis.js";
import { initialiseStatsText, statsTextEvents } from "../src/statText.js";
import { initialiseMolecules, moleculeTimedEvents } from "../src/CO2_H2O.js";
import { initialiseStomata, makeStomata, stomatalMovement } from "../src/Cells/stomata.js";
import { cellButtonFunctions, initialiseCellButtons } from "../src/cellButtons.js";
import { initialisePalisades, makePalisade } from "../src/Cells/palisade.js";
import { intialiseSponges } from "../src/Cells/sponges.js";
import game from "../main.js";


var isMobile = (window.innerWidth < 500 || window.innerHeight < 500) ? true : false;


export default class MainScene extends Phaser.Scene {
    constructor () {
        super('Main')
    }

    preload (){
        this.load.image('epidermis','./../Assets/epidermis.png');
        this.load.image('co2','./../Assets/co2.png');
        this.load.image('h2o','./../Assets/h2o.png');
        this.load.image('guardcell','./../Assets/guardcell.png');
        this.load.image('pore','./../Assets/pore.png');
        this.load.image('palisade','./../Assets/palisade.png');
        this.load.image('sponge','./../Assets/sponge.png');
        this.load.image('star', './../Assets/star.png');
        this.load.image('arrow', './../Assets/arrow.png');
        this.load.audio('entering', './../Assets/Entering.ogg');
        this.load.audio('leaving', './../Assets/Leaving.ogg');
        this.load.audio('photosynthesis','./../Assets/Photosynthesis.ogg');
    }

    create (){

        console.log(this.test);
        //game settings
        this.isMobile = isMobile;

        this.gameSpeed = 1;
        this.atomSpeed = (isMobile) ? 0.8 : 1;
        this.stomataSpeed = 1;

        this.gameWidth = (isMobile) ? 650 : 600;;
        this.gameHeight = (isMobile) ? 350 : 600;
        this.fontSize = (isMobile) ? '10px' : '12px' ;

        this.epidermisY1 = (this.isMobile) ? 70 : 100;
        this.epidermisY2 = (this.isMobile) ? 210 : 320;
        this.thickness = this.epidermisY2 - this.epidermisY1;

        this.startingPoints = 50;
        this.carbonPoints = 2;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.movement = "none";

        //Setting up world
        this.physics.world.setBounds(-5,-5, (isMobile) ? 660 : 610, (isMobile) ? 300 : 425);
        this.physics.world.on('worldbounds', (item1) => destroyOutOfBounds(item1, this));


        //GameOver
        this.data.set('gameBegun', false);

        //Setting up stats and text
        this.data.set('waterLost', 0);
        this.data.set('carbonGain', 0);
        this.data.set('waterLevel', 0);
        this.data.set('points', this.startingPoints);

        initialiseStatsText(this);
        statsTextEvents(this);

        //Game background
        this.gameBackground = this.add.rectangle(-10, -10, (isMobile) ? 670 : 620, (isMobile) ? 295 : 420).setOrigin(0,0);

        //Leaf background
        this.add.rectangle(0, this.epidermisY1 + 5, this.gameWidth, this.thickness, 0xa0b335, 0.6).setOrigin(0,0);

        initialiseEpidermis(this);

        //Make the CO2 and H2O molecules

        initialiseMolecules(this);
        moleculeTimedEvents(this);

        this.time.addEvent({
            delay:1000,
            callback: calculateWaterLevel,
            callbackScope: this,
            loop: true
        })

        //Make the guard cells and palisade cells

        this.data.set('aperture', 15);
        initialiseStomata(this);
        initialisePalisades(this);
        intialiseSponges(this);

        makePalisade((this.gameWidth * 0.6), (this.gameHeight * 0.25) + 50, this);
        makeStomata((this.gameWidth * 0.3) , this.epidermisY1 + ((this.isMobile) ? 10 : 15), this);

        //Buttons at the bottom to create new cells

        this.data.set('create', "none");
        this.instructText = this.add.text(0, (this.isMobile) ? 290 : 470 ,'Click to\nselect a cell',{ fontSize: this.fontSize, fill: '#000' , fontFamily: '"font1"'});

        initialiseCellButtons(this);
        cellButtonFunctions(this, game);
            
    }

    update(){   
        //Moving the stomatal pore
        stomatalMovement(this);

    }

}

function destroyOutOfBounds(item1, t)
{
    item1.gameObject.setActive(false);
    item1.gameObject.setVisible(false);

    if(item1.gameObject.texture.key === "h2o"){
        if((item1.gameObject.y > ((isMobile) ? 285 : 410) || item1.gameObject.y < 20) && (item1.gameObject.x > 2 || item1.gameObject.x < (isMobile) ? 650 : 600) - 2){
            t.data.values.waterLost += 1;
        }
    }
}


function calculateWaterLevel() 
{
    let withinLeaf = [];

    this.H2Ogroup.getChildren().forEach(child => {
        if( child.y < this.epidermisY2 && child.y > this.epidermisY1 && child.active){
            withinLeaf.push(child);
        };
    });

    this.data.values.waterLevel = withinLeaf.length;
};



