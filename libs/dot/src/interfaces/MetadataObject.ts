/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Metadata object for bindings that support it
 *
 * @remarks
 *
 * There are no restrictions on what types properties can contain, but comparisons are always done shallowly so if
 * metadata properties contain objects then the exact same object must be used on the binding and injection side as
 * determined by the `===` operator.
 *
 * @public
 */
export type MetadataObject = Record<string, unknown>;
