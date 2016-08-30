// Usage:
// $ phantomjs tests.js


var page = require('webpage').create();
var url = 'src/index.html';
var testMaxTime = 5000;

page.onResourceError = function(e) {
    console.log("Error loading " + e.url);
    phantom.exit();
}

function fail() {
    console.log("Failed");
    phantom.exit();
}

function waitForGenerate(fn, maxTime) {
    if (!maxTime) {
        maxTime = testMaxTime;
    }
    var start = new Date().getTime();
    var prevAddressCount = -1;
    var wait = function keepWaiting() {
        var now = new Date().getTime();
        var hasTimedOut = now - start > maxTime;
        var addressCount = page.evaluate(function() {
            return $(".address").length;
        });
        var hasFinished = addressCount > 0 && addressCount == prevAddressCount;
        prevAddressCount = addressCount;
        if (hasFinished) {
            fn();
        }
        else if (hasTimedOut) {
            console.log("Test timed out");
            fn();
        }
        else {
            setTimeout(keepWaiting, 100);
        }
    }
    wait();
}

function next() {
    if (tests.length > 0) {
        var testsStr = tests.length == 1 ? "test" : "tests";
        console.log(tests.length + " " + testsStr + " remaining");
        tests.shift()();
    }
    else {
        console.log("Finished with 0 failures");
        phantom.exit();
    }
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * See http://stackoverflow.com/a/12646864
 */
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

tests = [

// Page loads with status of 'success'
function() {
page.open(url, function(status) {
    if (status != "success") {
        console.log("Page did not load with status 'success'");
        fail();
    }
    next();
});
},

// Page has text
function() {
page.open(url, function(status) {
    var content = page.evaluate(function() {
        return document.body.textContent.trim();
    });
    if (!content) {
        console.log("Page does not have text");
        fail();
    }
    next();
});
},

// Entering mnemonic generates addresses
function() {
page.open(url, function(status) {
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability").trigger("input");
    });
    // get the address
    waitForGenerate(function() {
        var addressCount = page.evaluate(function() {
            return $(".address").length;
        });
        if (addressCount != 20) {
            console.log("Mnemonic did not generate addresses");
            console.log("Expected: " + expected);
            console.log("Got: " + actual);
            fail();
        }
        next();
    });
});
},

// Random button generates random mnemonic
function() {
page.open(url, function(status) {
    // check initial phrase is empty
    var phrase = page.evaluate(function() {
        return $(".phrase").text();
    });
    if (phrase != "") {
        console.log("Initial phrase is not blank");
        fail();
    }
    // press the 'generate' button
    page.evaluate(function() {
        $(".generate").click();
    });
    // get the new phrase
    waitForGenerate(function() {
        var phrase = page.evaluate(function() {
            return $(".phrase").val();
        });
        if (phrase.length <= 0) {
            console.log("Phrase not generated by pressing button");
            fail();
        }
        next();
    });
});
},

// Mnemonic length can be customized
function() {
page.open(url, function(status) {
    // set the length to 6
    var expectedLength = "6";
    page.evaluate(function() {
        $(".strength option[selected]").removeAttr("selected");
        $(".strength option[value=6]").prop("selected", true);
    });
    // press the 'generate' button
    page.evaluate(function() {
        $(".generate").click();
    });
    // check the new phrase is six words long
    waitForGenerate(function() {
        var actualLength = page.evaluate(function() {
            var words = $(".phrase").val().split(" ");
            return words.length;
        });
        if (actualLength != expectedLength) {
            console.log("Phrase not generated with correct length");
            console.log("Expected: " + expectedLength);
            console.log("Actual: " + actualLength);
            fail();
        }
        next();
    });
});
},

// Passphrase can be set
function() {
page.open(url, function(status) {
    // set the phrase and passphrase
    var expected = "15pJzUWPGzR7avffV9nY5by4PSgSKG9rba";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".passphrase").val("secure_passphrase").trigger("input");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Passphrase results in wrong address");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to bitcoin testnet
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "mucaU5iiDaJDb69BHLeDv8JFfGiyg2nJKi";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=1]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Bitcoin testnet address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to litecoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "LQ4XU8RX2ULPmPq9FcUHdVmPVchP9nwXdn";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=2]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Litecoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to dogecoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "DPQH2AtuzkVSG6ovjKk4jbUmZ6iXLpgbJA";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=3]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Dogecoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to shadowcash
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "SiSZtfYAXEFvMm3XM8hmtkGDyViRwErtCG";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=4]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Shadowcash address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to shadowcash testnet
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "tM2EDpVKaTiEg2NZg3yKg8eqjLr55BErHe";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=5]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Shadowcash testnet address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to viacoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "Vq9Eq4N5SQnjqZvxtxzo7hZPW5XnyJsmXT";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=6]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Viacoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to viacoin testnet
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "tM2EDpVKaTiEg2NZg3yKg8eqjLr55BErHe";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=7]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Viacoin testnet address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to jumbucks
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "JLEXccwDXADK4RxBPkRez7mqsHVoJBEUew";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=8]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Jumbucks address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to clam
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "xCp4sakjVx4pUAZ6cBCtuin8Ddb6U1sk9y";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=9]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("CLAM address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to dash
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "XdbhtMuGsPSkE6bPdNTHoFSszQKmK4S5LT";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=10]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("DASH address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to namecoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "Mw2vK2Bvex1yYtYF6sfbEg2YGoUc98YUD2";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=11]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Namecoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to peercoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "PVAiioTaK2eDHSEo3tppT9AVdBYqxRTBAm";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=12]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Peercoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP39 seed is set from phrase
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "20da140d3dd1df8713cefcc4d54ce0e445b4151027a1ab567b832f6da5fcc5afc1c3a3f199ab78b8e0ab4652efd7f414ac2c9a3b81bceb879a70f377aa0a58f3";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".seed").val();
        });
        if (actual != expected) {
            console.log("BIP39 seed is incorrectly generated from mnemonic");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP32 root key is set from phrase
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xprv9s21ZrQH143K2jkGDCeTLgRewT9F2pH5JZs2zDmmjXes34geVnFiuNa8KTvY5WoYvdn4Ag6oYRoB6cXtc43NgJAEqDXf51xPm6fhiMCKwpi";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".root-key").val();
        });
        if (actual != expected) {
            console.log("Root key is incorrectly generated from mnemonic");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Tabs show correct addresses when changed
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "17uQ7s2izWPwBmEVFikTmZUjbBKWYdJchz";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        // check the address is generated correctly
        waitForGenerate(function() {
            var actual = page.evaluate(function() {
                return $(".address:first").text();
            });
            if (actual != expected) {
                console.log("Clicking tab generates incorrect address");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP44 derivation path is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "m/44'/0'/0'/0";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the derivation path of the first address
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $("#bip44 .path").val();
        });
        if (actual != expected) {
            console.log("BIP44 derivation path is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP44 extended private key is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xprvA2DxxvPZcyRvYgZMGS53nadR32mVDeCyqQYyFhrCVbJNjPoxMeVf7QT5g7mQASbTf9Kp4cryvcXnu2qurjWKcrdsr91jXymdCDNxKgLFKJG";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the BIP44 extended private key
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".extended-priv-key").val();
        });
        if (actual != expected) {
            console.log("BIP44 extended private key is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP44 extended public key is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xpub6FDKNRvTTLzDmAdpNTc49ia9b4byd6vqCdUa46Fp3vqMcC96uBoufCmZXQLiN5AK3iSCJMhf9gT2sxkpyaPepRuA7W3MujV5tGmF5VfbueM";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the BIP44 extended public key
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".extended-pub-key").val();
        });
        if (actual != expected) {
            console.log("BIP44 extended public key is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP44 purpose field changes address list
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "1JbDzRJ2cDT8aat2xwKd6Pb2zzavow5MhF";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // change the bip44 purpose field to 45
        page.evaluate(function() {
            $("#bip44 .purpose").val("45");
            $("#bip44 .purpose").trigger("input");
        });
        waitForGenerate(function() {
            // check the address for the new derivation path
            var actual = page.evaluate(function() {
                return $(".address:first").text();
            });
            if (actual != expected) {
                console.log("BIP44 purpose field generates incorrect address");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP44 coin field changes address list
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "1F6dB2djQYrxoyfZZmfr6D5voH8GkJTghk";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // change the bip44 purpose field to 45
        page.evaluate(function() {
            $("#bip44 .coin").val("1");
            $("#bip44 .coin").trigger("input");
        });
        waitForGenerate(function() {
            // check the address for the new derivation path
            var actual = page.evaluate(function() {
                return $(".address:first").text();
            });
            if (actual != expected) {
                console.log("BIP44 coin field generates incorrect address");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP44 account field changes address list
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "1Nq2Wmu726XHCuGhctEtGmhxo3wzk5wZ1H";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // change the bip44 purpose field to 45
        page.evaluate(function() {
            $("#bip44 .account").val("1");
            $("#bip44 .account").trigger("input");
        });
        waitForGenerate(function() {
            // check the address for the new derivation path
            var actual = page.evaluate(function() {
                return $(".address:first").text();
            });
            if (actual != expected) {
                console.log("BIP44 account field generates incorrect address");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP44 change field changes address list
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "1KAGfWgqfVbSSXY56fNQ7YnhyKuoskHtYo";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // change the bip44 purpose field to 45
        page.evaluate(function() {
            $("#bip44 .change").val("1");
            $("#bip44 .change").trigger("input");
        });
        waitForGenerate(function() {
            // check the address for the new derivation path
            var actual = page.evaluate(function() {
                return $(".address:first").text();
            });
            if (actual != expected) {
                console.log("BIP44 change field generates incorrect address");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP32 derivation path can be set
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "16pYQQdLD1hH4hwTGLXBaZ9Teboi1AGL8L";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        // set the derivation path to m/1
        waitForGenerate(function() {
            page.evaluate(function() {
                $("#bip32 .path").val("m/1");
                $("#bip32 .path").trigger("input");
            });
            // check the address is generated correctly
            waitForGenerate(function() {
                var actual = page.evaluate(function() {
                    return $(".address:first").text();
                });
                if (actual != expected) {
                    console.log("Custom BIP32 path generates incorrect address");
                    console.log("Expected: " + expected);
                    console.log("Actual: " + actual);
                    fail();
                }
                next();
            });
        });
    });
});
},

// BIP32 can use hardened derivation paths
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "14aXZeprXAE3UUKQc4ihvwBvww2LuEoHo4";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        // set the derivation path to m/0'
        waitForGenerate(function() {
            page.evaluate(function() {
                $("#bip32 .path").val("m/0'");
                $("#bip32 .path").trigger("input");
            });
            // check the address is generated correctly
            waitForGenerate(function() {
                var actual = page.evaluate(function() {
                    return $(".address:first").text();
                });
                if (actual != expected) {
                    console.log("Hardened BIP32 path generates incorrect address");
                    console.log("Expected: " + expected);
                    console.log("Actual: " + actual);
                    fail();
                }
                next();
            });
        });
    });
});
},

// BIP32 extended private key is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xprv9va99uTVE5aLiutUVLTyfxfe8v8aaXjSQ1XxZbK6SezYVuikA9MnjQVTA8rQHpNA5LKvyQBpLiHbBQiiccKiBDs7eRmBogsvq3THFeLHYbe";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        // check the extended private key is generated correctly
        waitForGenerate(function() {
            var actual = page.evaluate(function() {
                return $(".extended-priv-key").val();
            });
            if (actual != expected) {
                console.log("BIP32 extended private key is incorrect");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP32 extended public key is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xpub69ZVZQzP4T8dwPxwbMzz36cNgwy4yzTHmETZMyihzzXXNi3thgg3HCow1RtY252wdw5rS8369xKnraN5Q93y3FkFfJp2XEHWUrkyXsjS93P";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        // check the extended public key is generated correctly
        waitForGenerate(function() {
            var actual = page.evaluate(function() {
                return $(".extended-pub-key").val();
            });
            if (actual != expected) {
                console.log("BIP32 extended public key is incorrect");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// Derivation path is shown in table
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "m/44'/0'/0'/0/0";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check for derivation path in table
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".index:first").text();
        });
        if (actual != expected) {
            console.log("Derivation path shown incorrectly in table");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Derivation path for address can be hardened
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "18exLzUv7kfpiXRzmCjFDoC9qwNLFyvwyd";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        waitForGenerate(function() {
            // select the hardened addresses option
            page.evaluate(function() {
                $(".hardened-addresses").prop("checked", true);
                $(".hardened-addresses").trigger("change");
            });
            waitForGenerate(function() {
                // check the generated address is hardened
                var actual = page.evaluate(function() {
                    return $(".address:first").text();
                });
                if (actual != expected) {
                    console.log("Hardened address is incorrect");
                    console.log("Expected: " + expected);
                    console.log("Actual: " + actual);
                    fail();
                }
                next();
            });
        });
    });
});
},

// Derivation path visibility can be toggled
function() {
page.open(url, function(status) {
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // toggle path visibility
        page.evaluate(function() {
            $(".index-toggle").click();
        });
        // check the path is not visible
        var isInvisible = page.evaluate(function() {
            return $(".index:first span").hasClass("invisible");
        });
        if (!isInvisible) {
            console.log("Toggled derivation path is visible");
            fail();
        }
        next();
    });
});
},

// Address is shown
function() {
page.open(url, function(status) {
    var expected = "1Di3Vp7tBWtyQaDABLAjfWtF6V7hYKJtug";
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability").trigger("input");
    });
    // get the address
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Address is not shown");
            console.log("Expected: " + expected);
            console.log("Got: " + actual);
            fail();
        }
        next();
    });
});
},

// Addresses are shown in order of derivation path
function() {
page.open(url, function(status) {
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability").trigger("input");
    });
    // get the derivation paths
    waitForGenerate(function() {
        var paths = page.evaluate(function() {
            return $(".index").map(function(i, e) {
                return $(e).text();
            });
        });
        if (paths.length != 20) {
            console.log("Total paths is less than expected: " + paths.length);
            fail();
        }
        for (var i=0; i<paths.length; i++) {
            var expected = "m/44'/0'/0'/0/" + i;
            var actual = paths[i];
            if (actual != expected) {
                console.log("Path " + i + " is incorrect");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
        }
        next();
    });
});
},

// Address visibility can be toggled
function() {
page.open(url, function(status) {
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // toggle address visibility
        page.evaluate(function() {
            $(".address-toggle").click();
        });
        // check the address is not visible
        var isInvisible = page.evaluate(function() {
            return $(".address:first span").hasClass("invisible");
        });
        if (!isInvisible) {
            console.log("Toggled address is visible");
            fail();
        }
        next();
    });
});
},

// Private key is shown
function() {
page.open(url, function(status) {
    var expected = "L26cVSpWFkJ6aQkPkKmTzLqTdLJ923e6CzrVh9cmx21QHsoUmrEE";
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability").trigger("input");
    });
    // get the address
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".privkey:first").text();
        });
        if (actual != expected) {
            console.log("Private key is not shown");
            console.log("Expected: " + expected);
            console.log("Got: " + actual);
            fail();
        }
        next();
    });
});
},

// Private key visibility can be toggled
function() {
page.open(url, function(status) {
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    waitForGenerate(function() {
        // toggle private key visibility
        page.evaluate(function() {
            $(".private-key-toggle").click();
        });
        // check the private key is not visible
        var isInvisible = page.evaluate(function() {
            return $(".privkey:first span").hasClass("invisible");
        });
        if (!isInvisible) {
            console.log("Toggled private key is visible");
            fail();
        }
        next();
    });
});
},

// More addresses can be generated
// A custom number of additional addresses can be generated
// Additional addresses are shown in order of derivation path

// BIP32 root key can be set by the user
// Setting BIP32 root key clears the existing phrase, passphrase and seed
// Clearing of phrase, passphrase and seed can be cancelled by user
// Custom BIP32 root key is used when changing the derivation path

// Incorrect mnemonic shows error
// Incorrect word shows suggested replacement
// Incorrect BIP32 root key shows error
// Derivation path not starting with m shows error
// Derivation path containing invalid characters shows useful error

// Github Issue 11: Default word length is 15
// https://github.com/dcpos/bip39/issues/11

// Github Issue 12: Generate more rows with private keys hidden
// https://github.com/dcpos/bip39/issues/12

// Github Issue 19: Mnemonic is not sensitive to whitespace
// https://github.com/dcpos/bip39/issues/19

// Github Issue 23: Use correct derivation path when changing tabs
// https://github.com/dcpos/bip39/issues/23

// Github Issue 26: When using a Root key derrived altcoins are incorrect
// https://github.com/dcpos/bip39/issues/26

];

console.log("Running tests...");
tests = shuffle(tests);
next();
