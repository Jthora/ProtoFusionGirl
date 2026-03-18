# iOS Prototype Animation Extraction Catalog

Generated: 2026-03-16T21:33:11.090Z

## Scope
- Source submodule: iOS_content_port/protofusiongirl_ios
- Legacy runtime: Objective-C++ cocos2d era prototype (pre-Swift)
- Migration target: Vite + React + TypeScript

## Graphically Wired Runtime Path
- Startup entities in scene: iOS_content_port/protofusiongirl_ios/FusionGirl/GameLayer.m (produceJane lines 39, produceDrone lines 40)
- Factory animation pack bindings: iOS_content_port/protofusiongirl_ios/FusionGirl/FusionGirlCoreFactory.mm
- Sprite sheets loaded into frame cache: iOS_content_port/protofusiongirl_ios/FusionGirl/GameAnimationLoadList.m (lines 19 and 20)
- Frame name assembly and animation creation: iOS_content_port/protofusiongirl_ios/FusionGirl/GameAnimationManager.mm
- Playback chaining: iOS_content_port/protofusiongirl_ios/FusionGirl/AnimationSprite.m

## Atlas Inventory
- Jane atlas frames: 117
- SleeperDrone atlas frames: 32
- Jane metadata anchors: metadata 2583, size 2589, texture 2599
- SleeperDrone metadata anchors: metadata 713, size 719, texture 729

## Source Art Inventory
- Jane source animation frames: 139
- SleeperDrone source animation frames: 32
- SleeperDrone extra stance frames: 16
- Pack source project files:
  - iOS_content_port/protofusiongirl_ios/Asset Development/Jane/Jane_Stance.zwd
  - iOS_content_port/protofusiongirl_ios/Asset Development/SleeperDrone_Stance.zwd

## Frame Packs Defined (Load List)
- JANE_RUN: Jane_Anim_Run_128 to 137 (line 24)
- JANE_STAND: Jane_Anim_Stand_1 to 16 (line 25)
- JANE_STAND_TO_READY: Jane_Anim_Stand_To_Ready_20 to 23 (line 26)
- JANE_READY_TO_STAND: Jane_Anim_Stand_To_Ready_18 to 24 (line 27)
- JANE_READY: Jane_Anim_Ready_25 to 40 (line 28)
- JANE_READY_TO_DASH: Jane_Anim_Ready_To_Dash_46 to 48 (line 29)
- JANE_DASH: Jane_Anim_Dash_49 to 56 (line 30)
- JANE_DASH_TO_SKID: Jane_Anim_Dash_To_Skid_58 to 60 (line 31)
- JANE_SKID: Jane_Anim_Skid_61 to 68 (line 32)
- JANE_SKID_TO_READY: Jane_Anim_Skid_To_Ready_70 to 72 (line 33)
- JANE_READY_TO_JUMP: Jane_Anim_Ready_To_Jump_75 to 77 (line 35)
- JANE_JUMP: Jane_Anim_Jump_81 to 84 (line 36)
- JANE_JUMP_TO_FALL: Jane_Anim_Jump_To_Fall_86 to 92 (line 37)
- JANE_FALL: Jane_Anim_Fall_93 to 96 (line 38)
- JANE_FALL_TO_READY_HARD: Jane_Anim_Fall_To_Ready_98 to 100 (line 39)
- JANE_FALL_TO_READY_MID: Jane_Anim_Fall_To_Ready_99 to 100 (line 40)
- JANE_FALL_TO_READY_LIGHT: Jane_Anim_Fall_To_Ready_100 to 100 (line 41)
- JANE_READY_TO_LEAP: Jane_Anim_Ready_To_Leap_102 to 104 (line 43)
- JANE_LEAP: Jane_Anim_Leap_105 to 108 (line 44)
- JANE_LEAP_TO_FALL_FAR: Jane_Anim_Leap_To_Fall_Far_110 to 116 (line 45)
- JANE_FALL_FAR: Jane_Anim_Fall_Far_117 to 120 (line 46)
- JANE_FALL_FAR_TO_SKID_HARD: Jane_Anim_Fall_Far_To_Skid_122 to 124 (line 47)
- JANE_FALL_FAR_TO_SKID_MID: Jane_Anim_Fall_Far_To_Skid_123 to 124 (line 48)
- JANE_FALL_FAR_TO_SKID_LIGHT: Jane_Anim_Fall_Far_To_Skid_124 to 124 (line 49)
- DRONE_STANCE_PRONE: SleeperDrone_Anim_Stance_Prone_1 to 16 (line 52)
- DRONE_ATTACK_TO_JUMP: SleeperDrone_Anim_Attack_Jump_17 to 23 (line 53)
- DRONE_ATTACK_JUMP: SleeperDrone_Anim_Attack_Jump_24 to 29 (line 54)
- DRONE_ATTACK_FROM_JUMP: SleeperDrone_Anim_Attack_Jump_30 to 32 (line 55)

## Controller Usage Map
- Jane controller animation keys (24 unique): JANE_STAND, JANE_STAND_TO_READY, JANE_READY, JANE_READY_TO_STAND, JANE_RUN, JANE_READY_TO_JUMP, JANE_JUMP, JANE_FALL_TO_READY_HARD, JANE_FALL_TO_READY_MID, JANE_FALL_TO_READY_LIGHT, JANE_JUMP_TO_FALL, JANE_FALL, JANE_READY_TO_LEAP, JANE_LEAP, JANE_FALL_FAR_TO_SKID_HARD, JANE_FALL_FAR_TO_SKID_MID, JANE_FALL_FAR_TO_SKID_LIGHT, JANE_LEAP_TO_FALL_FAR, JANE_FALL_FAR, JANE_READY_TO_DASH, JANE_DASH, JANE_DASH_TO_SKID, JANE_SKID, JANE_SKID_TO_READY
- Drone controller animation keys (4 unique): DRONE_STANCE_PRONE, DRONE_ATTACK_TO_JUMP, DRONE_ATTACK_JUMP, DRONE_ATTACK_FROM_JUMP

### Jane controller anchors
- JANE_STAND: line 92
- JANE_STAND_TO_READY: line 100
- JANE_READY: line 111
- JANE_READY_TO_STAND: line 125
- JANE_STAND: line 142
- JANE_RUN: line 171
- JANE_READY_TO_JUMP: line 204
- JANE_JUMP: line 210
- JANE_FALL_TO_READY_HARD: line 231
- JANE_FALL_TO_READY_MID: line 235
- JANE_FALL_TO_READY_LIGHT: line 239
- JANE_JUMP_TO_FALL: line 247
- JANE_FALL: line 253
- JANE_READY_TO_LEAP: line 266
- JANE_LEAP: line 272
- JANE_FALL_FAR_TO_SKID_HARD: line 293
- JANE_FALL_FAR_TO_SKID_MID: line 297
- JANE_FALL_FAR_TO_SKID_LIGHT: line 301
- JANE_LEAP_TO_FALL_FAR: line 309
- JANE_FALL_FAR: line 315
- JANE_READY_TO_DASH: line 331
- JANE_DASH: line 339
- JANE_DASH_TO_SKID: line 363
- JANE_SKID: line 376
- JANE_SKID_TO_READY: line 387
- JANE_RUN: line 402

### Drone controller anchors
- DRONE_STANCE_PRONE: line 32
- DRONE_ATTACK_TO_JUMP: line 50
- DRONE_ATTACK_JUMP: line 56
- DRONE_ATTACK_FROM_JUMP: line 64

## Gaps and Unused Assets
- Jane source frames missing in runtime atlas: 22
- Jane atlas frames not found in source folder: 0
- Highlighted Jane aim gap (10): Jane_Anim_Aim_1.png, Jane_Anim_Aim_10.png, Jane_Anim_Aim_2.png, Jane_Anim_Aim_3.png, Jane_Anim_Aim_4.png, Jane_Anim_Aim_5.png, Jane_Anim_Aim_6.png, Jane_Anim_Aim_7.png, Jane_Anim_Aim_8.png, Jane_Anim_Aim_9.png
- Highlighted Jane early run gap (12): Jane_Anim_Run_12.png, Jane_Anim_Run_13.png, Jane_Anim_Run_14.png, Jane_Anim_Run_15.png, Jane_Anim_Run_16.png, Jane_Anim_Run_17.png, Jane_Anim_Run_18.png, Jane_Anim_Run_19.png, Jane_Anim_Run_20.png, Jane_Anim_Run_21.png, Jane_Anim_Run_22.png, Jane_Anim_Run_23.png

### Legacy runtime assets without animation-pack references
- Sprite_Jane_Stance_Base.png
- jane_run_128x128.png
- jane_stand_128x128.png
- jane_test1.png
- jane_test2.png

## Rendering Behavior Note
- Controllers do not show character-specific tint/shader transforms.
- Facing is controlled through scaleX sign changes (JaneController.mm lines 73, 75; DroneController.mm lines 72)

## Machine-readable Artifact
- iOS_content_port/extraction_catalog/ios_animation_extraction_catalog.json
