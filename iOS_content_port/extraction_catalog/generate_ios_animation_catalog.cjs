const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repo = '/Users/jono/Documents/GitHub/ProtoFusionGirl';
const fusionRoot = path.join(repo, 'iOS_content_port/protofusiongirl_ios/FusionGirl');
const outDir = path.join(repo, 'iOS_content_port/extraction_catalog');

const files = {
  loadList: path.join(fusionRoot, 'GameAnimationLoadList.m'),
  janeController: path.join(fusionRoot, 'JaneController.mm'),
  droneController: path.join(fusionRoot, 'DroneController.mm'),
  gameLayer: path.join(fusionRoot, 'GameLayer.m'),
  factory: path.join(fusionRoot, 'FusionGirlCoreFactory.mm'),
  animMgr: path.join(fusionRoot, 'GameAnimationManager.mm'),
  animSprite: path.join(fusionRoot, 'AnimationSprite.m'),
  janePlist: path.join(fusionRoot, 'Resources/assets/animBatch_Jane.plist'),
  dronePlist: path.join(fusionRoot, 'Resources/assets/SpriteSheet_SleeperDrone.plist')
};

const read = (p) => fs.readFileSync(p, 'utf8');
const plutilJson = (p) => JSON.parse(execSync(`plutil -convert json -o - ${JSON.stringify(p)}`, { encoding: 'utf8' }));

function getLineAnchors(filePath, regex) {
  const lines = read(filePath).split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) out.push(i + 1);
  }
  return out;
}

function parseCreateAnimationPacks() {
  const lines = read(files.loadList).split(/\r?\n/);
  const packs = [];
  const re = /createAnimation:@"([^"]+)"\s+frameStart:(\d+)\s+frameEnd:(\d+)\s+imageSequenceName:@"([^"]+)"(?:\s+loop:(YES|NO))?(?:\s+reverse:(YES|NO))?(?:\s+delay:([0-9.]+)f)?/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    packs.push({
      key: m[1],
      frameStart: Number(m[2]),
      frameEnd: Number(m[3]),
      imageSequenceName: m[4],
      loop: m[5] || null,
      reverse: m[6] || null,
      delay: m[7] ? Number(m[7]) : null,
      line: i + 1
    });
  }
  return packs;
}

function parseSetAnimation(filePath) {
  const lines = read(filePath).split(/\r?\n/);
  const out = [];
  const re = /setAnimation:@"([^"]+)"/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) out.push({ key: m[1], line: i + 1 });
  }
  return out;
}

function parseFactoryKeys() {
  const lines = read(files.factory).split(/\r?\n/);
  const out = [];
  const re = /getAnimationPackForKey:@"([^"]+)"/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) out.push({ key: m[1], line: i + 1 });
  }
  return out;
}

function listFiles(cmd) {
  const raw = execSync(cmd, { encoding: 'utf8' }).trim();
  return raw ? raw.split('\n').map((s) => s.trim()).filter(Boolean) : [];
}

const packs = parseCreateAnimationPacks();
const janeControllerKeys = parseSetAnimation(files.janeController);
const droneControllerKeys = parseSetAnimation(files.droneController);
const factoryKeys = parseFactoryKeys();

const janeAtlas = plutilJson(files.janePlist);
const droneAtlas = plutilJson(files.dronePlist);
const janeAtlasFrames = Object.keys(janeAtlas.frames || {}).sort();
const droneAtlasFrames = Object.keys(droneAtlas.frames || {}).sort();

const janeSourceFrames = listFiles(`find ${JSON.stringify(path.join(repo, 'iOS_content_port/protofusiongirl_ios/Asset Development/Jane/Anim'))} -type f -name 'Jane_Anim_*.png' | sort`).map((p) => path.basename(p));
const droneAnimFrames = listFiles(`find ${JSON.stringify(path.join(repo, 'iOS_content_port/protofusiongirl_ios/Asset Development'))} -type f -name 'SleeperDrone_Anim_*.png' | sort`).map((p) => path.basename(p));
const droneStanceFrames = listFiles(`find ${JSON.stringify(path.join(repo, 'iOS_content_port/protofusiongirl_ios/Asset Development/SleeperDrone_Stance'))} -type f -name 'SleeperDrone_Stance_*.png' | sort`).map((p) => path.basename(p));
const packProjects = listFiles(`find ${JSON.stringify(path.join(repo, 'iOS_content_port/protofusiongirl_ios/Asset Development'))} -type f -name '*.zwd' | sort`).map((p) => p.replace(repo + '/', ''));

const sourceJaneSet = new Set(janeSourceFrames);
const atlasJaneSet = new Set(janeAtlasFrames);
const janeMissingInAtlas = janeSourceFrames.filter((f) => !atlasJaneSet.has(f));
const janeAtlasNotInSource = janeAtlasFrames.filter((f) => !sourceJaneSet.has(f));
const janeAimMissing = janeMissingInAtlas.filter((n) => /^Jane_Anim_Aim_\d+\.png$/.test(n));
const janeRunEarlyMissing = janeMissingInAtlas.filter((n) => /^Jane_Anim_Run_(1[2-9]|2[0-3])\.png$/.test(n));

const legacyRuntimeAssets = [
  'Sprite_Jane_Stance_Base.png',
  'jane_run_128x128.png',
  'jane_stand_128x128.png',
  'jane_test1.png',
  'jane_test2.png'
].filter((name) => fs.existsSync(path.join(fusionRoot, 'Resources/assets', name)));

const data = {
  generatedAt: new Date().toISOString(),
  source: {
    iosSubmodulePath: 'iOS_content_port/protofusiongirl_ios',
    engine: 'Objective-C++ cocos2d era prototype (pre-Swift)',
    target: 'Vite + React + TypeScript migration workspace'
  },
  wiring: {
    startupEntities: {
      gameLayerAnchors: {
        createJane: getLineAnchors(files.gameLayer, /produceJane/),
        createDrone: getLineAnchors(files.gameLayer, /produceDrone/),
        addViewport: getLineAnchors(files.gameLayer, /addChild:_mViewport/)
      },
      gameLayerFile: 'iOS_content_port/protofusiongirl_ios/FusionGirl/GameLayer.m'
    },
    factory: {
      file: 'iOS_content_port/protofusiongirl_ios/FusionGirl/FusionGirlCoreFactory.mm',
      animationPackBindings: factoryKeys,
      janeControllerAnchor: getLineAnchors(files.factory, /JaneController/),
      droneControllerAnchor: getLineAnchors(files.factory, /DroneController/)
    },
    atlasLoadList: {
      file: 'iOS_content_port/protofusiongirl_ios/FusionGirl/GameAnimationLoadList.m',
      loadJaneAtlasAnchors: getLineAnchors(files.loadList, /animBatch_Jane\.plist/),
      loadDroneAtlasAnchors: getLineAnchors(files.loadList, /SpriteSheet_SleeperDrone\.plist/),
      packs
    },
    animationManager: {
      file: 'iOS_content_port/protofusiongirl_ios/FusionGirl/GameAnimationManager.mm',
      frameAssemblyAnchors: getLineAnchors(files.animMgr, /frameName =/),
      frameLookupAnchors: getLineAnchors(files.animMgr, /spriteFrameByName/),
      actionCreateAnchors: getLineAnchors(files.animMgr, /animationWithSpriteFrames/)
    },
    animationPlayback: {
      file: 'iOS_content_port/protofusiongirl_ios/FusionGirl/AnimationSprite.m',
      addAnimationAnchors: getLineAnchors(files.animSprite, /addAnimation:/),
      playActionAnchors: getLineAnchors(files.animSprite, /CCAnimate/),
      callbackAnchors: getLineAnchors(files.animSprite, /delegate|callback|complete/i)
    }
  },
  atlases: {
    jane: {
      plist: 'iOS_content_port/protofusiongirl_ios/FusionGirl/Resources/assets/animBatch_Jane.plist',
      frameCount: janeAtlasFrames.length,
      frames: janeAtlasFrames,
      metadata: janeAtlas.metadata || {},
      metadataAnchors: { framesKey: 5, metadataKey: 2583, formatKey: 2587, sizeKey: 2589, textureFileNameKey: 2599 }
    },
    sleeperDrone: {
      plist: 'iOS_content_port/protofusiongirl_ios/FusionGirl/Resources/assets/SpriteSheet_SleeperDrone.plist',
      frameCount: droneAtlasFrames.length,
      frames: droneAtlasFrames,
      metadata: droneAtlas.metadata || {},
      metadataAnchors: { framesKey: 5, metadataKey: 713, formatKey: 717, sizeKey: 719, textureFileNameKey: 729 }
    }
  },
  sourceArt: {
    jane: {
      sourceDir: 'iOS_content_port/protofusiongirl_ios/Asset Development/Jane/Anim',
      frameCount: janeSourceFrames.length,
      frames: janeSourceFrames
    },
    sleeperDrone: {
      activeAnimFrameCount: droneAnimFrames.length,
      activeAnimFrames: droneAnimFrames,
      extraStanceFrameCount: droneStanceFrames.length,
      extraStanceFrames: droneStanceFrames
    },
    packProjects,
    legacyRuntimeAssetFiles: legacyRuntimeAssets
  },
  usageMap: {
    janeController: {
      file: 'iOS_content_port/protofusiongirl_ios/FusionGirl/JaneController.mm',
      setAnimationCalls: janeControllerKeys
    },
    droneController: {
      file: 'iOS_content_port/protofusiongirl_ios/FusionGirl/DroneController.mm',
      setAnimationCalls: droneControllerKeys
    },
    visualTransforms: {
      note: 'No character-specific tint/shader pipeline found in controllers; facing is handled by scaleX sign changes.',
      anchors: {
        janeScaleX: getLineAnchors(files.janeController, /scaleX/),
        droneScaleX: getLineAnchors(files.droneController, /scaleX/)
      }
    }
  },
  gaps: {
    janeSourceMissingInAtlasCount: janeMissingInAtlas.length,
    janeSourceMissingInAtlas: janeMissingInAtlas,
    janeAtlasMissingInSourceCount: janeAtlasNotInSource.length,
    janeAtlasMissingInSource: janeAtlasNotInSource,
    highlighted: {
      janeAimMissingCount: janeAimMissing.length,
      janeAimMissing,
      janeRunEarlyMissingCount: janeRunEarlyMissing.length,
      janeRunEarlyMissing
    }
  },
  migrationHint: {
    forViteReactTS: [
      'Use this catalog as source-of-truth to script atlas extraction into sprite sheets or frame manifests.',
      'Mirror iOS animation keys exactly first, then map to modern state machine transitions in TypeScript.',
      'Treat missing-in-atlas source frames as optional recovery candidates unless gameplay requires them.'
    ]
  }
};

const outJson = path.join(outDir, 'ios_animation_extraction_catalog.json');
fs.writeFileSync(outJson, JSON.stringify(data, null, 2));

const unique = (arr) => [...new Set(arr)];
const janeKeys = unique(janeControllerKeys.map((x) => x.key));
const droneKeys = unique(droneControllerKeys.map((x) => x.key));

const mdLines = [
  '# iOS Prototype Animation Extraction Catalog',
  '',
  `Generated: ${data.generatedAt}`,
  '',
  '## Scope',
  '- Source submodule: iOS_content_port/protofusiongirl_ios',
  '- Legacy runtime: Objective-C++ cocos2d era prototype (pre-Swift)',
  '- Migration target: Vite + React + TypeScript',
  '',
  '## Graphically Wired Runtime Path',
  `- Startup entities in scene: iOS_content_port/protofusiongirl_ios/FusionGirl/GameLayer.m (produceJane lines ${data.wiring.startupEntities.gameLayerAnchors.createJane.join(', ')}, produceDrone lines ${data.wiring.startupEntities.gameLayerAnchors.createDrone.join(', ')})`,
  '- Factory animation pack bindings: iOS_content_port/protofusiongirl_ios/FusionGirl/FusionGirlCoreFactory.mm',
  `- Sprite sheets loaded into frame cache: iOS_content_port/protofusiongirl_ios/FusionGirl/GameAnimationLoadList.m (lines ${data.wiring.atlasLoadList.loadJaneAtlasAnchors.join(', ')} and ${data.wiring.atlasLoadList.loadDroneAtlasAnchors.join(', ')})`,
  '- Frame name assembly and animation creation: iOS_content_port/protofusiongirl_ios/FusionGirl/GameAnimationManager.mm',
  '- Playback chaining: iOS_content_port/protofusiongirl_ios/FusionGirl/AnimationSprite.m',
  '',
  '## Atlas Inventory',
  `- Jane atlas frames: ${data.atlases.jane.frameCount}`,
  `- SleeperDrone atlas frames: ${data.atlases.sleeperDrone.frameCount}`,
  `- Jane metadata anchors: metadata ${data.atlases.jane.metadataAnchors.metadataKey}, size ${data.atlases.jane.metadataAnchors.sizeKey}, texture ${data.atlases.jane.metadataAnchors.textureFileNameKey}`,
  `- SleeperDrone metadata anchors: metadata ${data.atlases.sleeperDrone.metadataAnchors.metadataKey}, size ${data.atlases.sleeperDrone.metadataAnchors.sizeKey}, texture ${data.atlases.sleeperDrone.metadataAnchors.textureFileNameKey}`,
  '',
  '## Source Art Inventory',
  `- Jane source animation frames: ${data.sourceArt.jane.frameCount}`,
  `- SleeperDrone source animation frames: ${data.sourceArt.sleeperDrone.activeAnimFrameCount}`,
  `- SleeperDrone extra stance frames: ${data.sourceArt.sleeperDrone.extraStanceFrameCount}`,
  '- Pack source project files:',
  ...data.sourceArt.packProjects.map((p) => `  - ${p}`),
  '',
  '## Frame Packs Defined (Load List)',
  ...data.wiring.atlasLoadList.packs.map((p) => `- ${p.key}: ${p.imageSequenceName}${p.frameStart} to ${p.frameEnd} (line ${p.line})`),
  '',
  '## Controller Usage Map',
  `- Jane controller animation keys (${janeKeys.length} unique): ${janeKeys.join(', ')}`,
  `- Drone controller animation keys (${droneKeys.length} unique): ${droneKeys.join(', ')}`,
  '',
  '### Jane controller anchors',
  ...data.usageMap.janeController.setAnimationCalls.map((x) => `- ${x.key}: line ${x.line}`),
  '',
  '### Drone controller anchors',
  ...data.usageMap.droneController.setAnimationCalls.map((x) => `- ${x.key}: line ${x.line}`),
  '',
  '## Gaps and Unused Assets',
  `- Jane source frames missing in runtime atlas: ${data.gaps.janeSourceMissingInAtlasCount}`,
  `- Jane atlas frames not found in source folder: ${data.gaps.janeAtlasMissingInSourceCount}`,
  `- Highlighted Jane aim gap (${data.gaps.highlighted.janeAimMissingCount}): ${data.gaps.highlighted.janeAimMissing.join(', ')}`,
  `- Highlighted Jane early run gap (${data.gaps.highlighted.janeRunEarlyMissingCount}): ${data.gaps.highlighted.janeRunEarlyMissing.join(', ')}`,
  '',
  '### Legacy runtime assets without animation-pack references',
  ...data.sourceArt.legacyRuntimeAssetFiles.map((f) => `- ${f}`),
  '',
  '## Rendering Behavior Note',
  '- Controllers do not show character-specific tint/shader transforms.',
  `- Facing is controlled through scaleX sign changes (JaneController.mm lines ${data.usageMap.visualTransforms.anchors.janeScaleX.join(', ')}; DroneController.mm lines ${data.usageMap.visualTransforms.anchors.droneScaleX.join(', ')})`,
  '',
  '## Machine-readable Artifact',
  '- iOS_content_port/extraction_catalog/ios_animation_extraction_catalog.json',
  ''
];

const outMd = path.join(outDir, 'ios_animation_extraction_catalog.md');
fs.writeFileSync(outMd, mdLines.join('\n'));

console.log('WROTE_JSON=' + outJson);
console.log('WROTE_MD=' + outMd);
console.log('JANE_SOURCE=' + data.sourceArt.jane.frameCount);
console.log('JANE_ATLAS=' + data.atlases.jane.frameCount);
console.log('JANE_MISSING=' + data.gaps.janeSourceMissingInAtlasCount);
console.log('DRONE_SOURCE=' + data.sourceArt.sleeperDrone.activeAnimFrameCount);
console.log('DRONE_ATLAS=' + data.atlases.sleeperDrone.frameCount);
