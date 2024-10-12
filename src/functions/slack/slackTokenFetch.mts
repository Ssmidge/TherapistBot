import { Builder, Browser, By, Key, until, ThenableWebDriver } from "selenium-webdriver";
import getSlackAuthCode from "../email/imapParser.mts";
import Cache from "../../types/cache/Cache.mts";
import { Options } from "selenium-webdriver/chrome.js";

const tokenCache = new Cache();

const chromeOptions : Options = new Options().setChromeBinaryPath("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe").addArguments("--headless=new")
const builder = new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions);
// builder.getChromeOptions().addArguments("--disable-features=InfiniteSessionRestore");

async function runDriver() {
    const driver : ThenableWebDriver = builder.build() as unknown as ThenableWebDriver;
    try {
        await driver.get('https://hackclub.slack.com/');
        // email field
        const emailField = await driver.findElement(By.id('signup_email'));
        await emailField.sendKeys('slack@wltcs.us', Key.RETURN);
    
        // wait until the page refreshes
        await driver.wait(until.stalenessOf(emailField));
    
        // Now wait until the heading "Check your email for a code" appears
        await driver.wait(until.elementLocated(By.xpath('//h1[text()="Check your email for a code"]')), 2 * 60 * 1000);
    
        await driver.sleep(5000);
    
        // code
        const digits = (await getSlackAuthCode()).replace("-", "").split('').slice(0, 6);
    
        for (let i = 0; i < digits.length; i++) {
            const digit = digits[i];
            await driver.findElement(By.xpath(`//input[@aria-label="digit ${i + 1} of 6"]`))
                .sendKeys(digit);
        }
    
        await driver.wait(until.urlContains("/ssb/redirect"), 2 * 60 * 1000);
        await driver.get("https://hackclub.slack.com/");
    
        // get XOXD
        const xoxdToken = (await driver.manage().getCookie("d")).value;
        const xoxcToken = await driver.executeScript("const localConfig = JSON.parse(localStorage.getItem('localConfig_v2')); return localConfig.teams[localConfig.lastActiveTeamId].token;");

        return { xoxdToken, xoxcToken };
        
    
    } finally {
        await driver.quit()
    }
}

export default async function getSlackTokens() {
    const { xoxdToken, xoxcToken } = tokenCache.get("slackTokens") || await runDriver();
    tokenCache.set("slackTokens", { xoxdToken, xoxcToken });

    
    return { xoxdToken, xoxcToken };
}