zwavecontroller
===============

Intro
---------------

This project aims to provide a simple interface to interact with devices on a ZWave network.
All code is done in Node.js. 

None of the work is based on the official ZWave API. All ZWave API protocol information has been 
extracted from the 'open-zwave' (https://code.google.com/p/open-zwave/) project source code.

Scope
---------------

The controller is designed to handle a simple home system with one controller. The assumption is that 
the home network will be static with minimal changes.

To simplify the design interaction with a particular 'device' will be required when adding, removing or 
configuring device. As most devices are typically in sleep mode and cannot be reliably contacted, user interaction
will be required to ensure that a node is awake during above mentioned operations. Although this not ideal, 
device configuration should typically be minimal. This might be changed in the future. 

As the full API is not available, the more complicated features of ZWave will not be support. Features such
as multiple controllers, slave/master configurations, neighbourhood updates ... etc will not be supported.

Code
----------------

All code is in javascript using Node.js. Object member variables have been left as public but
they should never be directly accessed under any circumstances in actual code. This has been
done to allow for full coverage with unit testing.



