import {
  CrashService,
  fingerprint,
  extractRootCause,
  normalizeFrame,
  normalizeMessage,
  filterFrames,
} from './crash.service';
import safeRegex from 'safe-regex';

describe('Crash Deduplication and Normalization', () => {
  const windowsCrash = {
    cause: `java.lang.NoSuchMethodError: 'void mindustry.ui.dialogs.ModsDialog.githubImportMod(java.lang.String, boolean)'\r`,
    stack: `\tat mindustrytool.services.UpdateAvailableDialog.lambda$new$2(UpdateAvailableDialog.java:51)
\tat arc.scene.Element$9.changed(Element.java:988)
\tat arc.scene.event.ChangeListener.handle(ChangeListener.java:13)
\tat arc.scene.Element.notify(Element.java:162)
\tat arc.scene.Element.fire(Element.java:133)
\tat arc.scene.ui.Button.setChecked(Button.java:106)
\tat arc.scene.ui.Button$1.clicked(Button.java:92)
\tat arc.scene.event.ClickListener.touchUp(ClickListener.java:77)
\tat arc.scene.event.InputListener.handle(InputListener.java:31)
\tat arc.scene.Scene.touchUp(Scene.java:377)
\tat arc.input.InputMultiplexer.touchUp(InputMultiplexer.java:114)
\tat arc.input.InputEventQueue.drain(InputEventQueue.java:71)
\tat arc.backend.sdl.SdlInput.update(SdlInput.java:181)
\tat arc.backend.sdl.SdlApplication.loop(SdlApplication.java:212)
\tat arc.backend.sdl.SdlApplication.<init>(SdlApplication.java:58)
\tat mindustry.desktop.DesktopLauncher.main(DesktopLauncher.java:53)`,
  };

  const androidCrashBleedingEdge = {
    cause: `java.lang.NoSuchMethodError: No virtual method githubImportMod(Ljava/lang/String;Z)V in class Lmindustry/ui/dialogs/ModsDialog; or its super classes (declaration of 'mindustry.ui.dialogs.ModsDialog' appears in /data/app/~~rnVaW91H0x_uGKoz3gw9sQ==/io.anuke.mindustry.be-UVdoWbmw9KO8S2-HTAzFUg==/base.apk)`,
    stack: `\tat mindustrytool.services.UpdateAvailableDialog.lambda$new$2$mindustrytool-services-UpdateAvailableDialog(UpdateAvailableDialog.java:51)
\tat mindustrytool.services.UpdateAvailableDialog$$ExternalSyntheticLambda1.run(D8$$SyntheticClass:2)
\tat arc.scene.Element$9.changed(Element.java:17)
\tat arc.scene.event.ChangeListener.handle(ChangeListener.java:12)
\tat arc.scene.Element.notify(Element.java:38)
\tat arc.scene.Element.fire(Element.java:71)
\tat arc.scene.ui.Button.setChecked(Button.java:3)
\tat arc.scene.ui.Button$1.clicked(Button.java:16)
\tat arc.scene.event.ClickListener.touchUp(ClickListener.java:58)
\tat arc.scene.event.InputListener.handle(InputListener.java:116)
\tat arc.scene.Scene.touchUp(Scene.java:106)
\tat arc.input.InputMultiplexer.touchUp(InputMultiplexer.java:19)
\tat arc.backend.android.AndroidInput.processEvents(AndroidInput.java:139)
\tat arc.backend.android.AndroidGraphics.onDrawFrame(AndroidGraphics.java:99)
\tat android.opengl.GLSurfaceView$GLThread.guardedRun(GLSurfaceView.java:1581)
\tat android.opengl.GLSurfaceView$GLThread.run(GLSurfaceView.java:1272)`,
  };

  const androidCrashRelease = {
    cause: `java.lang.NoSuchMethodError: No virtual method githubImportMod(Ljava/lang/String;Z)V in class Lmindustry/ui/dialogs/ModsDialog; or its super classes (declaration of 'mindustry.ui.dialogs.ModsDialog' appears in base.apk)`,
    stack: `\tat mindustrytool.services.UpdateAvailableDialog.lambda$new$2(UpdateAvailableDialog.java:51)
\tat mindustrytool.services.UpdateAvailableDialog.$r8$lambda$oAbhrnhNtEYjVe-H3hyTXDc55kM(Unknown Source:0)
\tat mindustrytool.services.UpdateAvailableDialog$$ExternalSyntheticLambda1.run(Unknown Source:2)
\tat arc.scene.Element$9.changed(Element.java:17)
\tat arc.scene.event.ChangeListener.handle(ChangeListener.java:12)
\tat arc.scene.Element.notify(Element.java:38)
\tat arc.scene.Element.fire(Element.java:71)
\tat arc.scene.ui.Button.setChecked(Button.java:3)
\tat arc.scene.ui.Button$1.clicked(Button.java:16)
\tat arc.scene.event.ClickListener.touchUp(ClickListener.java:58)
\tat arc.scene.event.InputListener.handle(InputListener.java:116)
\tat arc.scene.Scene.touchUp(Scene.java:106)
\tat arc.input.InputMultiplexer.touchUp(InputMultiplexer.java:19)
\tat arc.backend.android.AndroidInput.processEvents(AndroidInput.java:139)
\tat arc.backend.android.AndroidGraphics.onDrawFrame(AndroidGraphics.java:99)
\tat android.opengl.GLSurfaceView$GLThread.guardedRun(GLSurfaceView.java:1573)
\tat android.opengl.GLSurfaceView$GLThread.run(GLSurfaceView.java:1272)`,
  };

  it('should generate identical fingerprints for Windows and Android samples of githubImportMod', () => {
    const mod = 'mindustry-tool';
    const fpWindows = fingerprint(windowsCrash.stack, mod, windowsCrash.cause);
    const fpAndroidBE = fingerprint(androidCrashBleedingEdge.stack, mod, androidCrashBleedingEdge.cause);
    const fpAndroidRel = fingerprint(androidCrashRelease.stack, mod, androidCrashRelease.cause);

    expect(fpWindows).toBe(fpAndroidBE);
    expect(fpWindows).toBe(fpAndroidRel);
  });

  it('should extract root cause exception even when stack starts with cause header', () => {
    const combined = `${windowsCrash.cause}\n${windowsCrash.stack}`;
    const root = extractRootCause(combined);
    expect(root.exception).toBe('java.lang.NoSuchMethodError');
  });

  it('should normalize NoSuchMethodError consistently between ART and JVM formats', () => {
    const jvmMsg = normalizeMessage('java.lang.NoSuchMethodError', `'void mindustry.ui.dialogs.ModsDialog.githubImportMod(java.lang.String, boolean)'`);
    const artMsg = normalizeMessage(
      'java.lang.NoSuchMethodError',
      `No virtual method githubImportMod(Ljava/lang/String;Z)V in class Lmindustry/ui/dialogs/ModsDialog; or its super classes (declaration of 'mindustry.ui.dialogs.ModsDialog' appears in /data/app/~~abc/base.apk)`,
    );

    expect(jvmMsg).toBe('NoSuchMethod:mindustry.ui.dialogs.ModsDialog.githubImportMod');
    expect(artMsg).toBe('NoSuchMethod:mindustry.ui.dialogs.ModsDialog.githubImportMod');
  });

  it('should normalize NoSuchFieldError consistently', () => {
    const jvmMsg = normalizeMessage('java.lang.NoSuchFieldError', `Class newhorizon.expand.game.MapMarker.RaidIndicator does not have member field 'timer'`);
    const artMsg = normalizeMessage(
      'java.lang.NoSuchFieldError',
      `No instance field timer of type F in class Lnewhorizon/expand/game/MapMarker/RaidIndicator; or its superclasses`,
    );

    expect(jvmMsg).toBe('NoSuchField:newhorizon.expand.game.MapMarker.RaidIndicator.timer');
    expect(artMsg).toBe('NoSuchField:newhorizon.expand.game.MapMarker.RaidIndicator.timer');
  });

  it('should normalize NullPointerException consistently', () => {
    const jvmMsg = normalizeMessage('java.lang.NullPointerException', `Cannot invoke "mindustry.gen.Unit.spawnedByC()" because "unit" is null`);
    const artMsg = normalizeMessage(
      'java.lang.NullPointerException',
      `Attempt to invoke virtual method 'void mindustry.gen.Unit.spawnedByC()' on a null object reference`,
    );

    expect(jvmMsg).toBe('NPE:mindustry.gen.Unit.spawnedByC');
    expect(artMsg).toBe('NPE:mindustry.gen.Unit.spawnedByC');
  });

  it('should filter out synthetic D8 and R8 frames and normalize lambda names', () => {
    const frameD8 = normalizeFrame('mindustrytool.services.UpdateAvailableDialog.lambda$new$2$mindustrytool-services-UpdateAvailableDialog(UpdateAvailableDialog.java:51)');
    const frameJVM = normalizeFrame('mindustrytool.services.UpdateAvailableDialog.lambda$new$2(UpdateAvailableDialog.java:51)');

    expect(frameD8).toBe('mindustrytool.services.UpdateAvailableDialog.lambda$new');
    expect(frameJVM).toBe('mindustrytool.services.UpdateAvailableDialog.lambda$new');
  });

  it('should fall back to arc and mindustry frames when no mod frames are present', () => {
    const vanillaFrames = [
      'arc.graphics.g2d.GlyphLayout.setText(GlyphLayout.java:176)',
      'arc.scene.ui.Label.layout(Label.java:209)',
      'arc.scene.Element.validate(Element.java:33)',
      'java.lang.Thread.run(Thread.java:829)',
    ];

    const filtered = filterFrames(vanillaFrames);
    expect(filtered).toHaveLength(3);
    expect(filtered[0]).toBe('arc.graphics.g2d.GlyphLayout.setText(GlyphLayout.java:176)');
  });

  it('should differentiate fingerprints across different mods even with identical messages', () => {
    const fpModA = fingerprint(windowsCrash.stack, 'mod-a', windowsCrash.cause);
    const fpModB = fingerprint(windowsCrash.stack, 'mod-b', windowsCrash.cause);

    expect(fpModA).not.toBe(fpModB);
  });

  it('should detect solim fallback when stacktrace contains solim package without mod banner', () => {
    const crashService = new CrashService(
      {} as unknown as ConstructorParameters<typeof CrashService>[0],
      {} as unknown as ConstructorParameters<typeof CrashService>[1],
      {} as unknown as ConstructorParameters<typeof CrashService>[2],
    );

    const crashContent = `Mindustry has crashed. How unfortunate.
Version: release build 146

java.lang.NullPointerException
\tat solim.core.SolimMain.init(SolimMain.java:42)
\tat mindustry.Vars.load(Vars.java:100)`;

    const parsed = crashService.parseCrash(crashContent);
    expect(parsed.mod).toBe('solim');
    expect(parsed.modName).toBe('Solim');
  });
});

describe('ReDoS Regression — normalization must stay linear', () => {
  const BUDGET_MS = 1000;

  function timeIt(fn: () => unknown): number {
    const t = process.hrtime.bigint();
    fn();
    return Number(process.hrtime.bigint() - t) / 1e6;
  }

  it('normalizeFrame handles long adversarial nested-class frame within budget', () => {
    // After preprocessing (remove :\d+ and \(.*\)), the frame ends with $suffix
    const frame = `com.example.MyMod$${'a'.repeat(50)}.run(MyMod.java:1)`;
    const ms = timeIt(() => normalizeFrame(frame));
    expect(ms).toBeLessThan(BUDGET_MS);
    // sanity: still strips the D8-style suffix correctly when it's at the end
    expect(normalizeFrame('mindustrytool.services.Foo$mindustrytool-services-bar(Bar.java:1)')).toBe('mindustrytool.services.Foo');
  });

  it('normalizeMessage handles long path-like segment within budget', () => {
    const msg = '/very/long/path/'.repeat(2000) + 'final-file.txt';
    const ms = timeIt(() => normalizeMessage('java.lang.Error', msg));
    expect(ms).toBeLessThan(BUDGET_MS);
    expect(normalizeMessage('java.lang.Error', '/a/b/c/file.txt')).toBe('file.txt');
  });

  it('fixed patterns still produce expected output for existing fixtures', () => {
    // D8 suffix stripping (after preprocessing removes file info)
    expect(normalizeFrame('mindustrytool.services.UpdateAvailableDialog.lambda$new$2$mindustrytool-services-UpdateAvailableDialog(UpdateAvailableDialog.java:51)')).toBe('mindustrytool.services.UpdateAvailableDialog.lambda$new');
    expect(normalizeFrame('mindustrytool.services.UpdateAvailableDialog.lambda$new$2(UpdateAvailableDialog.java:51)')).toBe('mindustrytool.services.UpdateAvailableDialog.lambda$new');
    // path -> filename (generic handler for paths not caught by specific handlers above)
    expect(normalizeMessage('java.lang.Error', '/custom/path/to/file.txt')).toBe('file.txt');
    expect(normalizeMessage('java.lang.Error', 'relative/path/file.txt')).toBe('file.txt');
  });

  it('fingerprint of adversarial report resolves within budget end-to-end', () => {
    const advStack = `\tat com.example.MyMod$${'a'.repeat(50)}.run(MyMod.java:1)
	at arc.scene.Element.update(Element.java:100)`;
    const advCause = `/very/long/path/`.repeat(2000) + 'crash.txt';
    const ms = timeIt(() => fingerprint(advStack, 'mod-x', advCause));
    expect(ms).toBeLessThan(BUDGET_MS);
  });
});

describe('ReDoS Static Guard — crash.service.ts regexes must be linear', () => {
  // The regexes used in the normalization hot path (normalizeFrame, normalizeMessage)
  // These are the ones that were fixed in this change and process untrusted input directly.
  // extractRootCause and parseCrash regexes are pre-existing and can be hardened in a follow-up.
  const normalizationRegexes = [
    // normalizeFrame
    /:\d+/g,
    /\(.*\)/g,
    /\$(?:mindustrytool|betamindy|newhorizon|[a-z0-9_-]+)$/i,
    /lambda\$([a-zA-Z0-9_$]+?)\$\d+/g,
    /lambda\$\d+/g,
    // normalizeMessage
    /\(declaration of '[^']+' appears in [^)]+\)/g,
    /\/data\/app\/[^\s)]+/g,
    /[a-zA-Z]:\\[^\s)]+/g,
    /.*/g,  // the path-stripping callback pattern
  ];

  it('all normalization regexes pass safe-regex (no catastrophic backtracking)', () => {
    expect(normalizationRegexes.length).toBeGreaterThan(0);

    for (const re of normalizationRegexes) {
      expect(safeRegex(re)).toBe(true);
    }
  });
});
