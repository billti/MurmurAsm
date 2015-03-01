// Hashing algorithms

"use strict";

var HashAlgorithms = (function(){
	var global = (Function("return this;"))();

	// Use the first 16-bytes for the little-endian 128-bit hash value

	function getAsmFunctions(stdlib, foreign, heap){
		// This code is written for asm.js, but it seems to actually be a little slower, even using the FireFox Math.imul built-in.
		//"use asm";   

		// First 4 Uint32 values are for the hash
		var HEAP32 = new stdlib.Uint32Array(heap); 

		// The below native function is only on FireFox currently, so hand-rolling
		// var imul32 = stdlib.Math.imul
		var imul32 = foreign.imul32;

		function fmix32(h){
			h = h|0;

			h = h ^ (h >>> 16);
			h = imul32(h|0, 0x85ebca6b|0)|0;
			h = h ^ (h >>> 13);
			h = imul32(h|0, 0xc2b2ae35|0)|0;
			h = h ^ (h >>> 16);
			return h | 0;
		}

		function hashBuffer(len, seed){
			// Based on the algorithm given in MurmurHash3_x86_128
			len = len|0;
			seed = seed|0;
			var h1 = 0, h2 = 0, h3 = 0, h4 = 0;
			var k1 = 0, k2 = 0, k3 = 0, k4 = 0;
			var c1 = 0x239b961b, c2 = 0xab0e9789, c3 = 0x38b34ae5, c4 = 0xa1e38b93;
			var nBlocks = 0, currBlock = 0, byteOffset = 0, tailBytes = 0;

			nBlocks   = ((len|0) / 16)|0;
			tailBytes = ((len|0) % 16)|0;
			h1 = seed|0;
			h2 = seed|0;
			h3 = seed|0;
			h4 = seed|0;

			// Loop through all the whole blocks
			while((currBlock|0) < (nBlocks|0)){
				// Get the byte offset for the block, skipping the hash, then divide by 4 to get the index
				byteOffset = (16 + ((currBlock * 16)|0))|0;
				k1 = HEAP32[(byteOffset +  0)>>2]|0;
				k2 = HEAP32[(byteOffset +  4)>>2]|0;
				k3 = HEAP32[(byteOffset +  8)>>2]|0;
				k4 = HEAP32[(byteOffset + 12)>>2]|0;

				k1 = imul32(k1|0, c1|0)|0;
				k1 = k1 << 15 | k1 >>> 17;
				k1 = imul32(k1|0, c2|0)|0; 
				h1 = h1 ^ k1;

				h1 = h1 << 19 | h1 >>> 13;
				h1 = (h1 + h2) | 0;
				h1 = ((imul32(h1|0, 5|0)|0) + 0x561ccd1b)|0;

				k2 = imul32(k2|0, c2|0)|0;
				k2 = k2 << 16 | k2 >>> 16;
				k2 = imul32(k2|0, c3|0)|0;
				h2 = h2 ^ k2;

				h2 = h2 << 17 | h2 >>> 15;
				h2 = (h2 + h3) | 0;
				h2 = ((imul32(h2|0,5|0)|0) + 0x0bcaa747)|0;

				k3 = imul32(k3|0,c3|0)|0;
				k3 = k3 << 17 | k3 >>> 15;
				k3 = imul32(k3|0,c4|0)|0;
				h3 = h3 ^ k3;

				h3 = h3 << 15 | h3 >>> 17;
				h3 = (h3 + h4)|0;
				h3 = ((imul32(h3|0,5|0)|0) + 0x96cd1c35)|0;

				k4 = imul32(k4|0, c4|0)|0; 
				k4 = k4 << 18 | k4 >>> 14;
				k4 = imul32(k4|0, c1|0)|0;
				h4 = h4 ^ k4;

				h4 = h4 << 13 | h4 >>> 19;
				h4 = (h4 + h1)|0;
				h4 = ((imul32(h4|0,5|0)|0) + 0x32ac3b17)|0;

				currBlock = (currBlock + 1)|0;
			}

			k1 = 0, k2 = 0, k3 = 0, k4 = 0;
			byteOffset = (16 + ((nBlocks * 16)|0))|0;

			if((tailBytes|0) > 12){
				k4 = HEAP32[(byteOffset + 12)>>2]|0;
				k4 = imul32(k4|0,c4|0)|0;
				k4 = k4 << 18 | k4 >> 14;
				k4 = imul32(k4|0, c1|0)|0;
				h4 = h4 ^ k4;
			}
			if((tailBytes|0) > 8){
				k3 = HEAP32[(byteOffset + 8)>>2]|0;
				k3 = imul32(k3|0, c3|0)|0;
				k3 = k3 << 17 | k3 >>> 15;
				k3 = imul32(k3|0,c4|0)|0;
				h3 = h3 ^ k3;
			}
			if((tailBytes|0) > 4){
				k2 = HEAP32[(byteOffset + 4)>>2]|0;
				k2 = imul32(k2|0, c2|0)|0;
				k2 = k2 << 16 | k2 >>> 16;
				k2 = imul32(k2|0, c3|0)|0;
				h2 = h2 ^ k2;
			}
			if((tailBytes|0) > 0){
				k1 = HEAP32[(byteOffset + 0)>>2]|0;
				k1 = imul32(k1|0,c1|0)|0;
				k1 = k1 << 15 | k1 >>> 17;
				k1 = imul32(k1|0,c2|0)|0;
				h1 = h1 ^ k1;
			}

			h1 = h1 ^ len;
			h2 = h2 ^ len;
			h3 = h3 ^ len;
			h4 = h4 ^ len;

			h1 = (h1 + h2)|0;
			h1 = (h1 + h3)|0;
			h1 = (h1 + h4)|0;
			h2 = (h2 + h1)|0;
			h3 = (h3 + h1)|0;
			h4 = (h4 + h1)|0;

			h1 = fmix32(h1)|0;
			h2 = fmix32(h2)|0;
			h3 = fmix32(h3)|0;
			h4 = fmix32(h4)|0;

			h1 = (h1 + h2)|0;
			h1 = (h1 + h3)|0;
			h1 = (h1 + h4)|0;
			h2 = (h2 + h1)|0;
			h3 = (h3 + h1)|0;
			h4 = (h4 + h1)|0;

			HEAP32[0  >> 2] = h1|0;
			HEAP32[4  >> 2] = h2|0;
			HEAP32[8  >> 2] = h3|0;
			HEAP32[12 >> 2] = h4|0;
		}
		return {
			hashBuffer: hashBuffer
		}
	}

	// Minimum asm.js heap size, 4k
	var heapSize = 0x1000; 
	var heap = new ArrayBuffer(heapSize);

	var foreign = {
		imul32: function imul32(x, y) {
		    // Keep all calculations below 2^53 so they don't lose precision in an IEEE 754 number.
		    var l = ((x & 0xffff) * (y | 0)) | 0;    // 2^16 * 2^32 = 2^48.  Result as Int32.
		    var h = ((x >>> 16) * (y | 0)) << 16;    // Shift down 16 bits (2^16) and multiply by 2^32 = 2^48.  Shift back up 16 (looses top 16 bits and returns an Int32).
		    return (h + l) >>> 0;                    // 2^32 + 2^32 = 2^33.  Unsigned right-shift by 0 to return as UInt32.
		}
	};

	var asmModule = getAsmFunctions(global, foreign, heap);

	function increaseHeap(minSize){
		// Keep increasing to next 2** until big enough for data + hash bytes
		while(heapSize < minSize){
			heapSize *= 2;
		}
		heap = new ArrayBuffer(heapSize);
		asmModule = getAsmFunctions(global, foreign, heap);
	}

	/**
	 * Returns the 128-bit Murmur3 hash for a string
	 * @param value The string to hash
	 * @param encoding The encoding to use.  May specify 'utf8' or 'utf16le'.  Defaults to utf8.
	 */
	function getMurmurHash3_128(value, encoding){
		var hashByteCount = 0;

		if(typeof value !== 'string') throw Error("Can only hash string values currently");
		if(encoding !== 'utf16le') encoding = 'utf8';

		if(encoding === 'utf16le'){
			hashByteCount = value.length * 2;
			if(heapSize < hashByteCount + 16) increaseHeap(hashByteCount + 16);
			var heapView = new Uint32Array(heap, 16);
			for(var idx = 0; idx < value.length; idx+=2){
				var uint = value.charCodeAt(idx);                // Low order bytes
				uint = uint | (value.charCodeAt(idx + 1) << 16); // High order bytes.  << will convert NaN (out of range) to 0.
				heapView[idx / 2] = uint;
			}
		} else {
			while(true){
				hashByteCount = getUtf8Buffer(value);
				if(hashByteCount === -1) {
					increaseHeap(heapSize * 2);
				} else {
					break;
				}
			}
		}

		asmModule.hashBuffer(hashByteCount, 0);
		return getHashString(heap);
	}

	function getUtf8Buffer(value){
		// TODO Only handles ASCII for now
		var currentUint32 = 0;
		var uint32Index = 0;
		var valueIndex = 0;
		var bufferLength = 0;
		var heapView = new Uint32Array(heap, 16);
		var heapOffset = 0;

		while(valueIndex < value.length){
			var charCode = value.charCodeAt(valueIndex);
			if(charCode > 127){
				throw "utf8 only supports ASCII right now";
			}
			currentUint32 |= ((charCode & 0xFF) << (8 * uint32Index++));
			if(++bufferLength > heapSize){
				return -1;
			};
			// Write out whenever we fill a uint32, or on the last byte.
			if(uint32Index === 4 || (valueIndex + 1) === value.length){
				heapView[heapOffset++] = currentUint32;
				currentUint32 = 0;
				uint32Index = 0;
			}
			valueIndex++;
		}
		return bufferLength;
	}

	/**
	 * Returns a string representation of a hash value from a buffer
	 * @param buff An ArrayBuffer with the first 16 bytes being a little endian hash value
	 */
	function getHashString(buff){
		var dataView = new Uint32Array(buff);
		var result = [];
		for(var i = 0; i < 4; i++){
			var tmp = "00000000" + dataView[i].toString(16);
			result.push("0x" + tmp.substring(tmp.length - 8).toLowerCase());
		}
		return result.join(",");
	}

	return {
		getMurmurHash3_128: getMurmurHash3_128,
	};
})();