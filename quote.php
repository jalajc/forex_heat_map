<?php

    if ($_SERVER["REQUEST_METHOD"] == "GET")
    {
        //prepare the url for hitting Yahoo
                
        $handle_country = fopen("country_table.csv", "r");
        if ($handle_country == false)
        {
            trigger_error("Could not read country_table file", E_USER_ERROR);
        };
        
        $url = 'http://download.finance.yahoo.com/d/quotes.csv?f=snl1+k+j&s=';
        
        do {
            // download first line of CSV country_table file
            $data_country = fgetcsv($handle_country);
            $url .= $data_country[2].$data_country[3]."=X+";
        } while (!feof($handle_country));
        
        $url = rtrim($url,"+");

        //rewind pointer to country_table file for the next loop
        rewind($handle_country);
        
        //prepare to hit Yahoo
        
        // headers for proxy servers
        $headers = [
            "Accept" => "*/*",
            "Connection" => "Keep-Alive",
            "User-Agent" => sprintf("curl/%s", curl_version()["version"])
        ];
    
        // open connection to Yahoo
        $context = stream_context_create([
            "http" => [
            "header" => implode(array_map(function($value, $key) { return sprintf("%s: %s\r\n", $key, $value); }, $headers, array_keys($headers))),
            "method" => "GET"
            ]
        ]);
        
        $handle = fopen($url, "r", false, $context);
        if ($handle === false)
        {
            trigger_error("Could not connect to Yahoo!", E_USER_ERROR);
        };

        //prepare json output
        header("Content-Type: application/json");
        print("[");
        
        do
        {
            // download first line of CSV Yahoo file
            $data = fgetcsv($handle);
            $data_country = fgetcsv($handle_country);

            if ($data === false || count($data) == 1 || $data[4] == 0 || $data[6] == 0)
            {
                continue;
            };
            $evaluation_weight = 1;
            $symbol_actual = substr($data[1],0,3);
            
            $sdr =  array(array("code"=>"USD","weight"=>41.73), array("code"=>"EUR","weight"=> 30.93), array("code"=>"CNY", "weight" => 10.92), array("code"=>"JPY","weight"=>8.33), array("code"=>GBP,"weight"=>8.09));
            
            $result = floatval($data[2] * 2 / ($data[4] + $data[6]));
        
            foreach ($sdr as $currency) {
                if ($currency["code"] == $symbol_actual) {
                    $evaluation_weight = 1 - ($currency["weight"] / 100);
                };
            };
            
            if ($result > 1) {
                $result = $result / $evaluation_weight;
            }
            else {
                $result = $result * $evaluation_weight;
            };
            
            //search for country
            
            // prepare stock as an associative array
            $stock = [
                "country" => $data_country[0],
                "symbol" => $data[1],
                "latest_price" => floatval($data[2]),
                "highest_price" => floatval($data[4]),
                "lowest_price" => floatval($data[6]),
                "evaluation" => $result
            ];
            
            // output stock as JSON
            print(json_encode($stock));
            if (!feof($handle))
            {
                print(",");
            };
        } while (!feof($handle));
        fclose($handle);
        fclose($handle_country);
        print("]");
    };
?>
