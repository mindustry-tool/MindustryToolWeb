# rewarded-ad-gpt Specification

## Purpose

Defines requirements for the frontend Google Publisher Tag (`googletag`) rewarded ad lifecycle, scoped slot and listener cleanup, configurable ad unit path, authentication gating, and translated toast feedback on the server credit page.

## Requirements

### Requirement: Rewarded ad slot display uses RewardedSlotReadyEvent
The `RewardedAd` component SHALL request an out-of-page rewarded slot via `googletag.defineOutOfPageSlot` with `OutOfPageFormat.REWARDED` and `googletag.display(slot)`, capture the `RewardedSlotReadyEvent` emitted by `rewardedSlotReady`, and display the ad by calling `event.makeRewardedVisible()` when the user clicks the watch button.

#### Scenario: User clicks watch ads when slot is ready
- **WHEN** `rewardedSlotReady` fires for the active slot and the user clicks the "Watch ads" button
- **THEN** the component requests an ad session nonce and invokes `event.makeRewardedVisible()` on the stored ready event rather than calling `googletag.display(slot)` again

### Requirement: Scoped GPT listener and slot lifecycle cleanup
The `RewardedAd` component SHALL filter all `pubads()` event listeners (`rewardedSlotReady`, `slotRenderEnded`, `rewardedSlotGranted`, `rewardedSlotClosed`) by the active slot instance, remove every registered listener via `pubads().removeEventListener` on slot teardown or unmount, and destroy only its own slot via `googletag.destroySlots([slot])`.

#### Scenario: Component unmounts or remounts under React Strict Mode
- **WHEN** `RewardedAd` unmounts before or after `googletag.cmd` executes
- **THEN** no stale listeners remain on `window.googletag.pubads()`, any pending timeout is cleared, and only the component's own slot is destroyed without affecting other GPT slots

### Requirement: No-fill and script-block handling
The `RewardedAd` component SHALL transition immediately to a no-ads state when `slotRenderEnded` fires with `isEmpty: true` for the active slot, and SHALL handle `gpt.js` load failure (`onError`) or load timeout cleanly without leaking timers.

#### Scenario: Ad server returns no fill
- **WHEN** `slotRenderEnded` fires for the active slot with `event.isEmpty === true`
- **THEN** the fallback timeout is cleared and the button transitions immediately to the translated no-ads state

#### Scenario: GPT script is blocked or fails to load
- **WHEN** the `gpt.js` script fails to load or the load timeout expires
- **THEN** the component exits the loading state and displays the unavailable/no-ads state

### Requirement: Post-ad reset and manual reload
After a rewarded ad is closed (`rewardedSlotClosed`), the `RewardedAd` component SHALL dispose the consumed slot and transition to an idle/retry state so the user must explicitly click to request a new ad rather than automatically re-fetching or reusing the spent slot.

#### Scenario: User closes a rewarded ad
- **WHEN** `rewardedSlotClosed` fires for the active slot
- **THEN** the consumed slot and its listeners are cleaned up and the UI resets to allow requesting a new ad on user action

### Requirement: Configurable ad unit path
The `RewardedAd` component SHALL read the GPT ad unit path from frontend environment configuration (`NEXT_PUBLIC_GPT_REWARDED_AD_UNIT`), falling back to `/22639388115/rewarded_web_example` only in non-production environments and marking the feature unsupported in production when no ad unit path is configured.

#### Scenario: Production build without configured ad unit
- **WHEN** `NODE_ENV === 'production'` and `NEXT_PUBLIC_GPT_REWARDED_AD_UNIT` is unset
- **THEN** `RewardedAd` does not register `/22639388115/rewarded_web_example` and displays the translated unsupported state

### Requirement: Authentication gating and localized toast feedback
The credit page SHALL gate `RewardedAd` behind `ClientProtectedElement` so unauthenticated users cannot start a rewarded ad flow, SHALL replace all `alert()` dialogs with translated `sonner` toasts across all supported locales, and SHALL invalidate the `['users', userId]` query on credit grant.

#### Scenario: Unauthenticated visitor opens server credit page
- **WHEN** an unauthenticated user views `/servers/[id]/credit`
- **THEN** `RewardedAd` is not active and the user is prompted to log in via `ClientProtectedElement`

#### Scenario: Authenticated user earns ad reward
- **WHEN** `rewardedSlotGranted` fires and the backend claim succeeds
- **THEN** a translated `sonner` toast confirms `+60` credits and the user query cache (`['users', userId]`) is invalidated
