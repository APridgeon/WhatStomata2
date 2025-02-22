import {get, dbRef, child, uid} from "./../src/firebaseInit.js";
import { config } from "./../game.js";
import { generateBackground, generateFullScreenButton, generateSpeakerButton } from "../src/commonComponents.js";
import { eventsCenter, resetEvents } from "../src/eventsCenter.js";

export default class LeaderBoardScene extends Phaser.Scene {
    constructor () {
        super('LeaderBoard')
    }

    preload () {
    }

    create () {


        ///camera
        this.cameras.main
            .setBounds(0, 0, 650, 4000)
            .centerOn(650/2, 1000)

        this.input.on("pointermove", function (p) {
            if (!p.isDown) return;
            this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
        });

        this.events.on('changedata-LeaderBoardData', () => {
            this.cameras.main.pan(650/2, 350/2, 1000, 'Linear', false)
        })

        ///background
        // generateBackground(this, 0x537c44, 0xf8f644, 1000, 1000);
        this.background = this.add.graphics()
            .fillGradientStyle(0x537c44,0x537c44,0xf8f644,0xf8f644, 0.7)
            .fillRect(-1500, -1500, 1500*2, 1500*2)
            .setScale(100, 100)

        this.tweens.add({
            targets: this.background,
            angle:360,
            ease:'linear',
            loop:-1,
            duration: 5000
        })


        generateSpeakerButton(this);
        generateFullScreenButton(this);

        this.tree = this.add.image(325, 500, 'tree')
            .setOrigin(0.5, 0.5)
            .setScale(6)
            .setAlpha(0.3);

        this.tweens.add({
            targets: this.tree,
            angle:360,
            ease:'linear',
            loop:-1,
            duration: 50000
        })

        ///generating leaderboard

        this.add.bitmapText(30, 20, 'casualTitle', 'Leaderboard!', 42)
            .setLetterSpacing(10);
        
        this.add.bitmapText(100, 100, 'casualTitle', 'Name', 24)
            .setLetterSpacing(12);
        
        this.add.bitmapText(250, 100, 'casualTitle', 'WUE', 24)
            .setLetterSpacing(12);


        this.add.bitmapText(430, 100, 'casualTitle', 'CO2', 24)
            .setLetterSpacing(12);

        this.data.set("LeaderBoardData", null);

        get(child(dbRef, `Leaderboard/`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    this.data.set("LeaderBoardData", Object.entries(snapshot.val()));
                } else {
                    console.log("No data available");
                }
            })
            .catch((error) => {
                console.error(error);
            });

        this.events.on('changedata-LeaderBoardData', () => {
            this.generateLeaderBoard(this.data.values.LeaderBoardData);
        });

        this.generateLeaderBoard = () => {
            if(this.data.values.LeaderBoardData){
                let dataArray = this.data.values.LeaderBoardData
                    .flat(1)
                    .filter(a => typeof(a) === 'object')
                    .sort((a,b) => b.carbonGain - a.carbonGain)
                    // .sort((a,b) => ((1/b.WUE) * b.carbonGain) - ((1/a.WUE) * a.carbonGain))
                    .slice(0, 100);
                
                
                
                dataArray.forEach((element, i) => {
                    let color = (i === 0) ? 0xff0000 : 0x423c56;

                    if(uid){
                        if(element.uid === uid.accessToken){
                            color = 0x0000ff;
                        }
                    }

                    

                    this.add.bitmapText(25, (i * 50) + 150, 'casualTitle', String(i+1), 24, 2)
                        .setLetterSpacing(15);
                    this.add.bitmapText(100, (i * 50) + 150, 'casual', element.userName, 24)
                        .setLetterSpacing(10)
                        .setTint(color);
                    this.add.bitmapText(250, (i * 50) + 150, 'casual', element.WUE, 24)
                        .setLetterSpacing(10)
                        .setTint(color);
                    this.add.bitmapText(430, (i * 50) + 150, 'casual', element.carbonGain, 24)
                        .setLetterSpacing(10)
                        .setTint(color);
                });

            ///restart

            this.submitButton = this.add.rectangle(580, 160, 120, 50, 0xff0000)
                .setAlpha(0.4)
                .setInteractive()
                .setOrigin(0.5, 0.5)
                .on('pointerover', () => {
                    this.submitButton.setAlpha(0.9)
                })
                .on('pointerout', () => {
                    this.submitButton.setAlpha(0.4)
                })
            
            this.submitText = this.add.bitmapText(580, 165, 'casual', 'Restart', 18)
                .setOrigin(0.5, 0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.submitText.setTint(0xff0000);
                    this.sys.game.destroy(true);
                    resetEvents(eventsCenter);
                    new Phaser.Game(config);
                    // document.addEventListener('mousedown', function newGame () {
                    //     game = new Phaser.Game(config);
                    //     document.removeEventListener('mousedown', newGame);
                    // });
                })
                .on('pointerover', () => {
                    this.submitButton.setAlpha(0.9)
                })
                .on('pointerout', () => {
                    this.submitButton.setAlpha(0.4)
                })
            
            
            }
        }

    }

}

