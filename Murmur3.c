// Bill Ticehurst, 2014
//
// MurmurHash3 implementation. Compile with the following at a VS Prompt: 
//
//     cl Murmur3.c /Zi
//
// Code as per http://en.wikipedia.org/wiki/MurmurHash and verified against the official project

#include <stdlib.h>
#include <stdio.h>
#include <conio.h>

typedef unsigned char uint8;
typedef unsigned int  uint32;

uint32 MurmurHash3_x86_32(const uint8 *key, int len, uint32 seed)
{
	const uint32 c1 = 0xcc9e2d51;
	const uint32 c2 = 0x1b873593;
	const int r1    = 15;
	const int r2    = 13;
	const int m     = 5;
	const uint32 n  = 0xe6546b64;
	uint32 hash = seed;

	const int blockCount = len / 4;
	const uint32 *pBlocks = (const uint32*)key;
	uint32 k = 0;

	for (int i = 0; i < blockCount; i++)
	{
		k = pBlocks[i];
		k *= c1;
		k = _rotl(k, r1);
		k *= c2;
		hash ^= k;
		hash = _rotl(hash, r2);
		hash = hash * m + n;
	}

	const int tailLen = len % 4;
	if (tailLen > 0)
	{
		k = 0;
		for (int i = 0; i < tailLen; i++)
		{
			k |= (key[blockCount * 4 + i] << (i * 8));
		}
		k *= c1;
		k = _rotl(k, r1);
		k *= c2;
		hash ^= k;
	}

	hash ^= len;
	hash ^= hash >> 16;
	hash *= 0x85ebca6b;
	hash ^= hash >> 13;
	hash *= 0xc2b2ae35;
	hash ^= hash >> 16;

	return hash;
}

int main(int argc, char* argv[])
{
	if (argc > 1)
	{
		int len = strlen(argv[1]);
		unsigned int hash = MurmurHash3_x86_32((unsigned char*)argv[1], len, 0);
		printf("Hash value for '%s' is %x\n", argv[1], hash);
	}
	else {
		_cputs("Attach debugger then press a key\n\n");
		_getch();

		// 0x2E4FF723 -> This code and https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js and https://code.google.com/p/smhasher/source/browse/trunk/MurmurHash3.cpp
		char pcFox[] = "The quick brown fox jumps over the lazy dog";
		uint32 pcFoxResult = MurmurHash3_x86_32((unsigned char*)pcFox, strlen(pcFox), 0);
		printf("Hash for 'fox' in ASCII: %x, expected 2E4FF723\n", pcFoxResult);

		// UTF-16
		wchar_t pwcFox[] = L"The quick brown fox jumps over the lazy dog";
		printf("Hash for 'fox' in UTF-16: %x\n", MurmurHash3_x86_32((unsigned char*)pwcFox, wcslen(pwcFox) * 2, 0));
	}
	return 0;
}
